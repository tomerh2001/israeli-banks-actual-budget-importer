/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import process from 'node:process';
import {createScraper, type ScraperCredentials} from 'israeli-bank-scrapers';
import _ from 'lodash';
import moment from 'moment';
import actual from '@actual-app/api';
import {type PayeeEntity, type TransactionEntity} from '@actual-app/api/@types/loot-core/types/models';
import stdout from 'mute-stdout';
import {type ScrapeTransactionsContext} from './utils.d';

export async function scrapeAndImportTransactions({companyId, bank}: ScrapeTransactionsContext) {
	function log(status: any, other?: Record<string, unknown>) {
		console.debug({bank: companyId, status, ...other});
	}

	try {
		const scraper = createScraper({
			companyId,
			startDate: moment().subtract(12, 'month').toDate(),
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

		const transactions = _(result.accounts)
			.filter(account => account.txns.length > 0)
			.flatMap(account => account.txns)
			.value();

		for (const account of result.accounts!) {
			if (account.txns.length <= 0) {
				continue;
			}
		}

		const accountBalance = result.accounts![0].balance!;
		const payees: PayeeEntity[] = await actual.getPayees();

		const mappedTransactions = transactions.map(async x => ({
			date: moment(x.date).format('YYYY-MM-DD'),
			amount: actual.utils.amountToInteger(x.chargedAmount),
			payee: _.find(payees, {name: x.description})?.id ?? (await actual.createPayee({name: x.description})),
			imported_payee: x.description,
			notes: x.memo,
			imported_id: `${x.identifier}-${moment(x.date).format('YYYY-MM-DD HH:mm:ss')}`,
		}));

		stdout.mute();
		const importResult = await actual.importTransactions(bank.actualAccountId, await Promise.all(mappedTransactions), {defaultCleared: true});
		stdout.unmute();

		if (_.isEmpty(importResult)) {
			console.error('Errors', importResult.errors);
			throw new Error('Failed to import transactions');
		} else {
			log('IMPORTED', {transactions: importResult.added.length});
		}

		if (!bank.reconcile) {
			return;
		}

		const currentBalance = actual.utils.integerToAmount(await actual.getAccountBalance(bank.actualAccountId));
		const balanceDiff = accountBalance - currentBalance;

		// Use a stable imported_id per account so we can find and update/delete the same
		// reconciliation transaction instead of creating a new one every run.
		const reconciliationImportedId = `reconciliation-${bank.actualAccountId}`;

		// Fetch all transactions for this account and look for an existing reconciliation.
		// Use a wide date range so we always find it if it exists.
		const allAccountTxns: TransactionEntity[] = await actual.getTransactions(
			bank.actualAccountId,
			'2000-01-01',
			moment().add(1, 'year').format('YYYY-MM-DD'),
		);

		const existingReconciliation = allAccountTxns.find(txn => txn.imported_id === reconciliationImportedId);

		// If balances are already in sync, remove any existing reconciliation and exit.
		if (balanceDiff === 0) {
			if (existingReconciliation) {
				stdout.mute();
				await actual.deleteTransaction(existingReconciliation.id);
				stdout.unmute();
				log('RECONCILIATION_REMOVED');
			}

			return;
		}

		log('RECONCILIATION', {
			from: currentBalance,
			to: accountBalance,
			diff: balanceDiff,
		});

		const reconciliationTxn = {
			account: bank.actualAccountId,
			date: moment().format('YYYY-MM-DD'),
			amount: actual.utils.amountToInteger(balanceDiff),
			payee: undefined,
			imported_payee: 'Reconciliation',
			notes: `Reconciliation from ${currentBalance.toLocaleString()} to ${accountBalance.toLocaleString()}`,
			imported_id: reconciliationImportedId,
		};

		stdout.mute();
		if (existingReconciliation) {
			// Update the single reconciliation transaction
			await actual.updateTransaction(existingReconciliation.id, reconciliationTxn);
			stdout.unmute();
			log('RECONCILIATION_UPDATED', {transactionId: existingReconciliation.id});
		} else {
			// Create the reconciliation transaction for the first time
			const reconciliationResult = await actual.importTransactions(
				bank.actualAccountId,
				[reconciliationTxn],
			);
			stdout.unmute();

			if (!reconciliationResult || _.isEmpty(reconciliationResult.added)) {
				console.error('Reconciliation errors', reconciliationResult?.errors);
			} else {
				log('RECONCILIATION_ADDED', {transactions: reconciliationResult.added.length});
			}
		}
	} catch (error) {
		console.error('Error', companyId, error);
	} finally {
		log('DONE');
	}
}
