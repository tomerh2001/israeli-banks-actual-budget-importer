/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable unicorn/no-process-exit */

/* eslint-disable no-await-in-loop */

import process from 'node:process';
import {type CompanyTypes} from '@tomerh2001/israeli-bank-scrapers';
import actual from '@actual-app/api';
import Queue from 'p-queue';
import moment from 'moment';
import cron, {type ScheduledTask, validate} from 'node-cron';
import cronstrue from 'cronstrue';
import stdout from 'mute-stdout';
import config from '../config.json' assert {type: 'json'};
import packageJson from '../package.json' assert {type: 'json'};
import type {Config, ConfigBank} from './config.d.ts';
import type {ScrapeTransactionsContext} from './importer.types.ts';
import {scrapeAndImportTransactions} from './importer.ts';

let scheduledTask: ScheduledTask;
const importerConfig = config as unknown as Config;
const bundledActualApiVersion = packageJson.dependencies?.['@actual-app/api'] ?? 'unknown';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const actualInitConfig: Config['actual']['init'] = importerConfig.actual.init;
const actualBudgetConfig: Config['actual']['budget'] = importerConfig.actual.budget;
const configuredBanks = Object.entries(importerConfig.banks) as Array<[CompanyTypes, ConfigBank]>;

function formatActualVersionMismatch(serverVersion: string) {
	return [
		`Actual server version mismatch: server reports ${serverVersion},`,
		`but this importer bundles @actual-app/api ${bundledActualApiVersion}.`,
		`Update the importer image to a release built against Actual ${serverVersion},`,
		`or downgrade Actual to ${bundledActualApiVersion}.`,
	].join(' ');
}

async function assertActualVersionCompatibility() {
	// Actual versions the server and @actual-app/api together, so fail early
	// with an actionable message instead of surfacing a migration stack trace.
	const serverVersion = await actual.getServerVersion();
	if (!('version' in serverVersion)) {
		return serverVersion;
	}

	if (serverVersion.version !== bundledActualApiVersion) {
		throw new Error(formatActualVersionMismatch(serverVersion.version));
	}

	return serverVersion;
}

/**
 * Main execution function that orchestrates the scraping and importing of bank transactions.
 *
 * This function:
 * 1. Initializes a queue with concurrency controls to manage multiple bank scraping operations
 * 2. Initializes the Actual Budget application and downloads the specified budget
 * 3. Iterates through configured banks and queues scraping/import tasks for each
 * 4. Waits for all queued tasks to complete
 * 5. Shuts down the Actual Budget connection
 *
 * The function mutes stdout during Actual Budget operations to reduce noise in console output.
 *
 * @returns {Promise<void>} A promise that resolves when all transactions have been scraped,
 * imported, and the application has shut down cleanly.
 *
 * @throws May throw errors from Actual Budget initialization, budget download, or bank scraping operations.
 */
async function run() {
	const queue = new Queue({
		concurrency: 10,
		autoStart: true,
		interval: 1000,
		intervalCap: 10,
	});

	stdout.mute();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	await actual.init(actualInitConfig);
	const serverVersion = await assertActualVersionCompatibility();

	try {
		await actual.downloadBudget(actualBudgetConfig.syncId, actualBudgetConfig);
	} catch (error) {
		if (error instanceof Error && error.message.includes('out-of-sync-migrations')) {
			const serverVersionNote = 'version' in serverVersion
				? ` Server reports ${serverVersion.version}; importer bundles @actual-app/api ${bundledActualApiVersion}.`
				: '';
			const mismatchMessage = [
				'Actual failed with "out-of-sync-migrations".',
				'This usually means the Actual server version and the importer\'s bundled @actual-app/api version do not match.',
				serverVersionNote.trim(),
			].filter(Boolean).join(' ');

			throw new Error(mismatchMessage);
		}

		throw error;
	}

	stdout.unmute();

	for (const [companyId, bank] of configuredBanks) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const taskContext: ScrapeTransactionsContext = {companyId, bank};
		await queue.add(async () => scrapeAndImportTransactions(taskContext));
	}

	await queue.onIdle();

	stdout.mute();
	await actual.shutdown();
	stdout.unmute();

	console.log('Done');
}

/**
 * Safely executes the run function with error handling and scheduling information.
 *
 * @remarks
 * This function wraps the main run function with try-catch error handling to prevent
 * uncaught exceptions from crashing the application. After execution (successful or not),
 * it prints the next scheduled run time if a scheduled task exists.
 *
 * @returns A Promise that resolves when the run function completes or an error is caught
 *
 * @throws Does not throw - all errors are caught and logged to console
 */
async function safeRun() {
	try {
		await run();
	} catch (error) {
		console.error('Error running scraper:', error);
	} finally {
		if (scheduledTask) {
			printNextRunTime();
		}
	}
}

/**
 * Prints the next scheduled run time of the task to the console.
 *
 * Displays the time remaining until the next run in a human-readable format
 * (e.g., "in 2 hours") along with the exact timestamp in 'YYYY-MM-DD HH:mm:ss' format.
 *
 * @returns {void}
 */
function printNextRunTime() {
	const nextRun = scheduledTask.getNextRun();
	console.log('Next run:', moment(nextRun).fromNow(), 'at', moment(nextRun).format('YYYY-MM-DD HH:mm:ss'));
}

if (process.env?.SCHEDULE) {
	if (!validate(process.env.SCHEDULE)) {
		throw new Error(`Invalid cron schedule: ${process.env?.SCHEDULE}`);
	}

	console.log('Started scheduled run:', process.env?.SCHEDULE, `(${cronstrue.toString(process.env?.SCHEDULE)})`);
	scheduledTask = cron.schedule(process.env.SCHEDULE, safeRun);

	printNextRunTime();
} else {
	await safeRun();
	setTimeout(() => process.exit(0), moment.duration(5, 'seconds').asMilliseconds());
}
