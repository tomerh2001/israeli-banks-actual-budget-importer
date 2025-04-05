
/* eslint-disable no-await-in-loop */

/* eslint-disable n/file-extension-in-import */

import fs from 'node:fs';
import {type CompanyTypes, createScraper, type ScraperCredentials} from 'israeli-bank-scrapers';
import _ from 'lodash';
import moment from 'moment';
import papa from 'papaparse';
import {type InitConfig} from '@actual-app/api/@types/loot-core/server/main';
import actual from '@actual-app/api';
import {config} from '../config.ts';

async function scrape(companyId: CompanyTypes, credentials: ScraperCredentials) {
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

		const result = await scraper.scrape(credentials);
		if (!result.success) {
			throw new Error(`Failed to scrape (${result.errorType}): ${result.errorMessage}`);
		}

		const transactions = _(result.accounts)
			.filter(account => account.txns.length > 0)
			.flatMap('txns')
			.value();

		for (const account of result.accounts!) {
			if (account.txns.length <= 0) {
				continue;
			}

			console.log('Account', _.pick(account, ['accountNumber', 'balance']), 'Transactions', account.txns.length);
		}

		const csv = papa.unparse(transactions);
		fs.mkdirSync('artifacts', {recursive: true});
		fs.writeFileSync(`artifacts/${companyId}.csv`, csv);
		console.log('CSV written to', `../artifacts/${companyId}.csv`);
	} catch (error) {
		console.error('Error scraping', companyId, error);
	}
}

await actual.init(config.actual.init);
await actual.downloadBudget(config.actual.budget.syncId, config.actual.budget);
await actual.sync();

const accounts = await actual.getAccounts();
console.log('Accounts', accounts);

for (const [companyId, credentials] of _.entries(config.credentials)) {
	await scrape(companyId as CompanyTypes, credentials);
}

await actual.shutdown();
console.log('Done');
