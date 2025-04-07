/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable import/extensions */
/* eslint-disable n/file-extension-in-import */
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
			executablePath: '/opt/homebrew/bin/chromium',
			additionalTransactionInformation: true,
			verbose: true,
			showBrowser: false,
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
		console.log('Account', account);

		const payees: PayeeEntity[] = await actual.getPayees();
		const mappedTransactions = transactions.map(async x => ({
			date: moment(x.date).format('YYYY-MM-DD'),
			amount: actual.utils.amountToInteger(x.chargedAmount),
			payee: _.find(payees, {name: x.description})?.id ?? await actual.createPayee({name: x.description}),
			imported_payee: x.description,
			notes: x.status,
		}));

		const importResult = await actual.importTransactions(bank.actualAccountId, await Promise.all(mappedTransactions), {defaultCleared: true});
		if (importResult.errors) {
			console.error('Errors', importResult.errors);
		} else {
			console.log('Imported', importResult.added, 'transactions');
		}
	} catch (error) {
		console.error('Error', companyId, error);
	}
}

