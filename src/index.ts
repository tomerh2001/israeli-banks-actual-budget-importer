
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
		console.log('Progress', companyId, payload);
	});
	console.log('Scraper created', companyId);

	const result = await scraper.scrape(credentials);
	if (!result.success) {
		throw new Error(`Failed to scrape (${result.errorType}): ${result.errorMessage}`);
	}

	for (const account of result.accounts!) {
		console.log('Account', _.pick(account, ['accountNumber', 'balance']), 'Transactions', account.txns.length);
		if (account.txns.length === 0) {
			console.log('No transactions, skipping');
			continue;
		}

		const csv = papa.unparse(account.txns);
		fs.mkdirSync('artifacts', {recursive: true});
		fs.writeFileSync(`artifacts/${account.accountNumber}.csv`, csv);
		console.log('CSV written to', `../artifacts/${account.accountNumber}.csv`);
	}

	console.log('Done');
}

await scrape(CompanyTypes.hapoalim, credentials.hapoalim as ScraperCredentials);
await scrape(CompanyTypes.visaCal, credentials.visaCal as ScraperCredentials);
