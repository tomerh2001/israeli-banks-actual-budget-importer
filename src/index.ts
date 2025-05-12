/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-await-in-loop */
/* eslint-disable n/file-extension-in-import */

import process from 'node:process';
import {type CompanyTypes} from 'israeli-bank-scrapers';
import _ from 'lodash';
import actual from '@actual-app/api';
import Queue from 'p-queue';
import moment from 'moment';
import config from '../config.json' assert {type: 'json'};
import type {ConfigBank} from './config.d.ts';
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

setTimeout(() => process.exit(0), moment.duration(5, 'seconds').asMilliseconds());
