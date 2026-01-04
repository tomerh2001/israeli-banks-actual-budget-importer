/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import process from 'node:process';
import {createScraper, type ScraperCredentials} from '@tomerh2001/israeli-bank-scrapers';
import _ from 'lodash';
import moment from 'moment';
import actual from '@actual-app/api';
import {type PayeeEntity, type TransactionEntity} from '@actual-app/api/@types/loot-core/src/types/models';
import stdout from 'mute-stdout';
import {type ScrapeTransactionsContext} from './importer.d';

// If you exported these from your config types file, import them from there instead.
type AccountsSelector = string[] | 'all';
type ReconcileOption = boolean | 'consolidate';
type BankTarget = {
	actualAccountId: string;
	reconcile?: ReconcileOption;
	accounts?: AccountsSelector;
};

function isFiniteNumber(x: unknown): x is number {
	return typeof x === 'number' && Number.isFinite(x);
}

function stripUndefined<T extends Record<string, any>>(object: T): T {
	return Object.fromEntries(Object.entries(object).filter(([, v]) => v !== undefined)) as T;
}

function normalizeTargets(bank: any): BankTarget[] {
	// New config: targets[]
	if (Array.isArray(bank?.targets) && bank.targets.length > 0) {
		return bank.targets
			.filter((t: any) => t?.actualAccountId)
			.map((t: any) => ({
				actualAccountId: t.actualAccountId,
				// Keep the union semantics:
				// - false/undefined => no reconcile
				// - true => reconcile per-target
				// - 'consolidate' => reconcile consolidated per actualAccountId
				reconcile: t.reconcile as ReconcileOption | undefined,
				accounts: t.accounts,
			}));
	}

	// Legacy config: actualAccountId + reconcile
	if (bank?.actualAccountId) {
		// Backward compatibility: legacy `reconcile: true` historically behaved as consolidated.
		const legacyReconcile: ReconcileOption | undefined
			= bank.reconcile === true ? 'consolidate' : (bank.reconcile as ReconcileOption | undefined);

		return [{
			actualAccountId: bank.actualAccountId,
			reconcile: legacyReconcile,
			// Legacy behavior did not support selecting accounts; treat as "all".
			accounts: 'all',
		}];
	}

	return [];
}

function selectScraperAccounts(
	allAccounts: any[] | undefined,
	selector: AccountsSelector | undefined,
) {
	const accounts = allAccounts ?? [];
	if (selector === undefined || selector === 'all') {
		return accounts;
	}

	const set = new Set(selector);
	return accounts.filter(a => set.has(String(a.accountNumber)));
}

function reconciliationTargetKey(selector: AccountsSelector | undefined, selectedAccounts: any[]) {
	// Prefer concrete selected account numbers (deterministic once scrape ran)
	const nums = selectedAccounts
		.map(a => String(a?.accountNumber))
		.filter(Boolean)
		.sort();

	if (nums.length > 0) {
		return nums.join(',');
	}

	// Fallback
	if (selector === undefined || selector === 'all') {
		return 'all';
	}

	return [...selector].map(String).sort().join(',');
}

function stableImportedId(companyId: string, accountNumber: string | undefined, txn: any) {
	// Prefer scraper identifier if present; fall back to a deterministic composite.
	const idPart
		= txn?.identifier
			?? `${moment(txn?.date).format('YYYY-MM-DD')}:${txn?.chargedAmount}:${txn?.description ?? ''}:${txn?.memo ?? ''}`;

	// AccountNumber is important once multiple cards are aggregated into one Actual account.
	return `${companyId}:${accountNumber ?? 'unknown'}:${idPart}`;
}

export async function scrapeAndImportTransactions({companyId, bank}: ScrapeTransactionsContext) {
	function log(status: any, other?: Record<string, unknown>) {
		console.debug({
			datetime: new Date().toISOString(), bank: companyId, status, ...other,
		});
	}

	try {
		const targets = normalizeTargets(bank);
		if (targets.length === 0) {
			throw new Error(`No targets configured for ${companyId}. Provide bank.actualAccountId (legacy) or bank.targets[].actualAccountId.`);
		}

		const scraper = createScraper({
			companyId,
			startDate: moment().subtract(2, 'years').toDate(),
			// ExecutablePath: '/opt/homebrew/bin/chromium',
			args: ['--user-data-dir=./chrome-data'],
			additionalTransactionInformation: true,
			verbose: process.env?.VERBOSE === 'true',
			showBrowser: process.env?.SHOW_BROWSER === 'true',
		});

		scraper.onProgress((_companyId, payload) => {
			log(payload.type);
		});

		const result = await scraper.scrape(bank as ScraperCredentials);
		if (!result.success) {
			throw new Error(`Failed to scrape (${result.errorType}): ${result.errorMessage}`);
		}

		log('ACCOUNTS', {
			accounts: result.accounts?.map(x => ({
				accountNumber: x.accountNumber,
				balance: x.balance,
				txns: x.txns.length,
			})),
		});

		const payees: PayeeEntity[] = await actual.getPayees();

		// Process each target independently (supports per-card, per-company, and consolidated).
		for (const target of targets) {
			const selectedAccounts = selectScraperAccounts(result.accounts as any[], target.accounts);

			// Transactions to import: selected accounts with txns.
			const transactions = _(selectedAccounts)
				.filter(a => Array.isArray(a.txns) && a.txns.length > 0)
				.flatMap(a => a.txns.map((t: any) => ({txn: t, accountNumber: String(a.accountNumber)})))
				.value();

			if (transactions.length === 0) {
				log('NO_TRANSACTIONS', {actualAccountId: target.actualAccountId});
			} else {
				const mappedTransactions = transactions.map(async ({txn, accountNumber}) => stripUndefined({
					date: moment(txn.date).format('YYYY-MM-DD'),
					amount: actual.utils.amountToInteger(txn.chargedAmount),
					payee: _.find(payees, {name: txn.description})?.id ?? (await actual.createPayee({name: txn.description})),
					imported_payee: txn.description,
					notes: txn.memo,
					imported_id: stableImportedId(companyId, accountNumber, txn),
				}));

				stdout.mute();
				const importResult = await actual.importTransactions(
					target.actualAccountId,
					await Promise.all(mappedTransactions),
					{defaultCleared: true},
				);
				stdout.unmute();

				if (_.isEmpty(importResult)) {
					console.error('Errors', importResult.errors);
					throw new Error('Failed to import transactions');
				} else {
					log('IMPORTED', {actualAccountId: target.actualAccountId, transactions: importResult.added.length});
				}
			}

			const reconcileMode = target.reconcile;
			if (!reconcileMode) {
				continue;
			}

			const consolidated = reconcileMode === 'consolidate';

			// Reconciliation balance: sum finite balances of selected accounts.
			const reconAccounts = selectedAccounts
				.filter(a => isFiniteNumber(a?.balance))
				.map(a => ({accountNumber: String(a.accountNumber), balance: a.balance as number}));

			if (reconAccounts.length === 0) {
				log('RECONCILE_SKIPPED_NO_BALANCES', {
					actualAccountId: target.actualAccountId,
					selectedAccounts: selectedAccounts.map(a => a?.accountNumber),
				});
				continue;
			}

			const scraperBalance = reconAccounts.reduce((sum, a) => sum + a.balance, 0);

			log('RECONCILE_INPUT', {
				actualAccountId: target.actualAccountId,
				accounts: reconAccounts,
				balance: scraperBalance,
			});

			const currentBalance = actual.utils.integerToAmount(await actual.getAccountBalance(target.actualAccountId));
			const balanceDiff = scraperBalance - currentBalance;

			// Stable imported_id:
			// - consolidated: one reconciliation txn per Actual account
			// - non-consolidated (true): one reconciliation txn per target (account selector set)
			const reconciliationImportedId = consolidated
				? `reconciliation-${target.actualAccountId}`
				: `reconciliation-${target.actualAccountId}:${reconciliationTargetKey(target.accounts, selectedAccounts)}`;

			const allAccountTxns: TransactionEntity[] = await actual.getTransactions(
				target.actualAccountId,
				'2000-01-01',
				moment().add(1, 'year').format('YYYY-MM-DD'),
			);

			const existingReconciliation = allAccountTxns.find(txn => txn.imported_id === reconciliationImportedId);

			if (existingReconciliation && balanceDiff === 0) {
				log('RECONCILIATION_NOT_NEEDED', {actualAccountId: target.actualAccountId});
				continue;
			}

			const reconciliationTxn = stripUndefined({
				account: target.actualAccountId,
				date: moment().format('YYYY-MM-DD'),
				amount: actual.utils.amountToInteger(balanceDiff),
				payee: null, // IMPORTANT: never pass undefined to updateTransaction schema
				imported_payee: 'Reconciliation',
				notes: `Reconciliation${consolidated ? '' : ` (${reconciliationTargetKey(target.accounts, selectedAccounts)})`} from ${currentBalance.toLocaleString()} to ${scraperBalance.toLocaleString()}`,
				imported_id: reconciliationImportedId,
			});

			if (existingReconciliation) {
				stdout.mute();
				await actual.updateTransaction(existingReconciliation.id, reconciliationTxn);
				stdout.unmute();

				log('RECONCILIATION_UPDATED', {
					actualAccountId: target.actualAccountId,
					from: currentBalance,
					to: scraperBalance,
					diff: balanceDiff,
				});
				continue;
			}

			stdout.mute();
			const reconciliationResult = await actual.importTransactions(target.actualAccountId, [reconciliationTxn]);
			stdout.unmute();

			if (!reconciliationResult || _.isEmpty(reconciliationResult.added)) {
				console.error('Reconciliation errors', reconciliationResult?.errors);
			} else {
				log('RECONCILIATION_ADDED', {
					actualAccountId: target.actualAccountId,
					from: currentBalance,
					to: scraperBalance,
					diff: balanceDiff,
				});
			}
		}
	} catch (error) {
		console.error('Error', companyId, error);
	} finally {
		log('DONE');
	}
}
