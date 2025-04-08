/* eslint-disable no-await-in-loop */
/* eslint-disable n/file-extension-in-import */

import {type CompanyTypes} from 'israeli-bank-scrapers';
import _ from 'lodash';
import actual from '@actual-app/api';
import Queue from 'p-queue';
import {config, type ConfigBank} from '../config.ts';
import {scrapeAndImportTransactions} from './utils.ts';

const queue = new Queue({
	concurrency: 10,
	autoStart: true,
	interval: 1000,
	intervalCap: 10,
});

await actual.init(config.actual.init);
await actual.downloadBudget(config.actual.budget.syncId, config.actual.budget);

for (const [companyId, bank] of _.entries(config.banks) as Array<[CompanyTypes, ConfigBank]>) {
	await queue.add(async () => scrapeAndImportTransactions({companyId, bank}));
}

await queue.onIdle();
await actual.shutdown();
console.log('Done');
