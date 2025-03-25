
import fs from 'node:fs';
import {CompanyTypes, createScraper, type ScraperCredentials} from 'israeli-bank-scrapers';
import _ from 'lodash';
import moment from 'moment';
import papa from 'papaparse';
import credentials from '../credentials.json';

async function scrape(companyId: CompanyTypes, credentials: ScraperCredentials) {
	const scraper = createScraper({
		companyId,
		startDate: moment().subtract(2, 'year').toDate(),
		executablePath: '/opt/homebrew/bin/chromium',
		additionalTransactionInformation: true,
		verbose: true,
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
		.flatMap(account => account.txns)
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
}

await scrape(CompanyTypes.hapoalim, credentials.hapoalim as ScraperCredentials);
await scrape(CompanyTypes.visaCal, credentials.visaCal as ScraperCredentials);

console.log('Done');
