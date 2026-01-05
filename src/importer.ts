/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-await-in-loop */
// Importer.ts
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import process from 'node:process';
import {createScraper, type ScraperCredentials} from '@tomerh2001/israeli-bank-scrapers';
import _ from 'lodash';
import moment from 'moment';
import actual from '@actual-app/api';
import {type PayeeEntity} from '@actual-app/api/@types/loot-core/src/types/models';
import stdout from 'mute-stdout';
import {type ScrapeTransactionsContext} from './importer.d';
import {
	normalizeTargets,
	selectScraperAccounts,
	stripUndefined,
	stableImportedId,
	reconciliationTargetKey,
	uniqueReconciliationImportedId,
} from './importer.utils';

/**
 * Scrapes bank transactions from a financial institution and imports them into Actual Budget.
 *
 * This function:
 * 1. Validates and normalizes target accounts configuration
 * 2. Creates and runs a scraper instance for the specified bank
 * 3. Processes scraped transactions for each configured target account
 * 4. Maps and imports transactions into Actual Budget, creating payees as needed
 * 5. Optionally reconciles account balances by creating reconciliation transactions
 *
 * @param context - The scraping context configuration
 * @param context.companyId - The unique identifier for the financial institution (bank company ID)
 * @param context.bank - Bank credentials and configuration including account mappings and reconciliation settings
 *
 * @throws {Error} When no targets are configured for the specified bank
 * @throws {Error} When scraping fails with error type and message
 * @throws {Error} When transaction import fails
 *
 * @remarks
 * - Scrapes transactions from the past 2 years
 * - Automatically creates payees if they don't exist in Actual Budget
 * - Generates stable imported IDs to prevent duplicate imports
 * - Reconciliation transactions are only created when there's a balance difference
 * - All transactions are marked as cleared by default
 * - Logs progress and results throughout the process
 *
 * @example
 * ```typescript
 * await scrapeAndImportTransactions({
 *   companyId: 'israeliBank',
 *   bank: {
 *     userCode: '12345',
 *     password: 'secret',
 *     targets: [{
 *       actualAccountId: 'account-uuid',
 *       accounts: ['123456'],
 *       reconcile: true
 *     }]
 *   }
 * });
 * ```
 */
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
			timeout: moment(process.env?.TIMEOUT ?? 15, 'minutes').milliseconds(),
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

		// Process each target independently.
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

			// Reconcile: boolean-only, and ALWAYS creates a NEW reconciliation txn (no updates).
			if (!target.reconcile) {
				continue;
			}

			// Reconciliation balance: sum finite balances of selected accounts.
			const reconAccounts = selectedAccounts
				.filter(a => _.isFinite(a?.balance))
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

			// If there is no diff, creating a reconciliation txn is typically noise.
			// If you truly want a txn even for 0, remove this guard.
			if (balanceDiff === 0) {
				log('RECONCILIATION_NOT_NEEDED', {actualAccountId: target.actualAccountId});
				continue;
			}

			const targetKey = reconciliationTargetKey(target.accounts, selectedAccounts);
			const reconciliationImportedId = uniqueReconciliationImportedId(target.actualAccountId);

			const reconciliationTxn = stripUndefined({
				account: target.actualAccountId,
				date: moment().format('YYYY-MM-DD'),
				amount: actual.utils.amountToInteger(balanceDiff),
				payee: null, // IMPORTANT: never pass undefined to updateTransaction schema
				imported_payee: 'Reconciliation',
				notes: `Reconciliation from ${currentBalance.toLocaleString()} to ${scraperBalance.toLocaleString()}`,
				imported_id: reconciliationImportedId, // NEW every run
			});

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
					importedId: reconciliationImportedId,
				});
			}
		}
	} catch (error) {
		console.error('Error', companyId, error);
	} finally {
		log('DONE');
	}
}
