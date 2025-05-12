/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/extensions */
/* eslint-disable n/file-extension-in-import */

import process from 'node:process';
import {createScraper, type ScraperCredentials} from 'israeli-bank-scrapers';
import _ from 'lodash';
import moment from 'moment';
import actual from '@actual-app/api';
import {type PayeeEntity, type TransactionEntity} from '@actual-app/api/@types/loot-core/types/models';
import {type ScrapeTransactionsContext} from './utils.d';

export async function scrapeAndImportTransactions({companyId, bank}: ScrapeTransactionsContext) {
	try {
		const scraper = createScraper({
			companyId,
			startDate: moment().subtract(6, 'month').toDate(),
			// ExecutablePath: '/opt/homebrew/bin/chromium',
			args: ['--user-data-dir=/app/chrome-data'],
			additionalTransactionInformation: true,
			verbose: process.env?.VERBOSE === 'true',
			showBrowser: process.env?.SHOW_BROWSER === 'true',
		});
		scraper.onProgress((companyId, payload) => {
			console.debug('Progress', companyId, payload);
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

		const accounts = await actual.getAccounts() as TransactionEntity[];
		const account = _.find(accounts, {id: bank.actualAccountId})!;
		const accountBalance = result.accounts![0].balance!;
		console.log('Account', account, 'Balance', accountBalance);

		const payees: PayeeEntity[] = await actual.getPayees();
		const mappedTransactions = transactions.map(async x => ({
			date: moment(x.date).format('YYYY-MM-DD'),
			amount: actual.utils.amountToInteger(x.chargedAmount),
			payee: _.find(payees, {name: x.description})?.id ?? (await actual.createPayee({name: x.description})),
			imported_payee: x.description,
			notes: x.status,
			imported_id: `${x.identifier}-${moment(x.date).format('YYYY-MM-DD HH:mm:ss')}`,
		}));

		const importResult = await actual.importTransactions(bank.actualAccountId, await Promise.all(mappedTransactions), {defaultCleared: true});
		if (_.isEmpty(importResult)) {
			console.error('Errors', importResult.errors);
			throw new Error('Failed to import transactions');
		} else {
			console.log('Imported', importResult.added, 'transactions');
		}

		if (!bank.reconcile) {
			return;
		}

		const currentBalance = actual.utils.integerToAmount(await actual.getAccountBalance(bank.actualAccountId));
		const balanceDiff = accountBalance - currentBalance;
		if (balanceDiff === 0) {
			return;
		}

		console.log('Balance diff', balanceDiff);
		const reconciliationResult = await actual.importTransactions(bank.actualAccountId, [{
			date: moment().format('YYYY-MM-DD'),
			amount: actual.utils.amountToInteger(balanceDiff),
			payee: null,
			imported_payee: 'Reconciliation',
			notes: `Reconciliation from ${currentBalance.toLocaleString()} to ${accountBalance.toLocaleString()}`,
			imported_id: `reconciliation-${moment().format('YYYY-MM-DD HH:mm:ss')}`,
		}]);
		if (_.isEmpty(reconciliationResult)) {
			console.error('Reconciliation errors', reconciliationResult.errors);
		} else {
			console.info('Added a reconciliation transaction from', currentBalance, 'to', accountBalance);
		}
	} catch (error) {
		console.error('Error', companyId, error);
	}
}

