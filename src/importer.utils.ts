/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import moment from 'moment';
import type {ConfigBankTarget, AccountsSelector} from './config';

export function isFiniteNumber(x: unknown): x is number {
	return typeof x === 'number' && Number.isFinite(x);
}

export function stripUndefined<T extends Record<string, any>>(object: T): T {
	return Object.fromEntries(Object.entries(object).filter(([, v]) => v !== undefined)) as T;
}

/**
 * Normalizes bank config into a list of targets.
 *
 * IMPORTANT:
 * - reconcile is boolean-only.
 * - No consolidation modes.
 */
export function normalizeTargets(bank: any): ConfigBankTarget[] {
	// New config: targets[]
	if (Array.isArray(bank?.targets) && bank.targets.length > 0) {
		return bank.targets
			.filter((t: any) => t?.actualAccountId)
			.map((t: any) => ({
				actualAccountId: t.actualAccountId,
				reconcile: Boolean(t.reconcile),
				accounts: t.accounts as AccountsSelector | undefined,
			}));
	}

	// Legacy config: actualAccountId + reconcile
	if (bank?.actualAccountId) {
		return [{
			actualAccountId: bank.actualAccountId,
			reconcile: Boolean(bank.reconcile),
			accounts: 'all',
		}];
	}

	return [];
}

export function selectScraperAccounts(
	allAccounts: any[] | undefined,
	selector: AccountsSelector | undefined,
) {
	const accounts = allAccounts ?? [];
	if (selector === undefined || selector === 'all') {
		return accounts;
	}

	const set = new Set(selector);
	return accounts.filter(a => set.has(String(a.accountNumber)));
}

export function reconciliationTargetKey(selector: AccountsSelector | undefined, selectedAccounts: any[]) {
	// Prefer concrete selected account numbers (deterministic once scrape ran)
	const nums = selectedAccounts
		.map(a => String(a?.accountNumber))
		.filter(Boolean)
		.sort();

	if (nums.length > 0) {
		return nums.join(',');
	}

	// Fallback
	if (selector === undefined || selector === 'all') {
		return 'all';
	}

	return [...selector].map(String).sort().join(',');
}

export function stableImportedId(companyId: string, accountNumber: string | undefined, txn: any) {
	// Prefer scraper identifier if present; fall back to a deterministic composite.
	const idPart = txn?.identifier
		?? `${moment(txn?.date).format('YYYY-MM-DD')}:${txn?.chargedAmount}:${txn?.description ?? ''}:${txn?.memo ?? ''}`;

	// AccountNumber is important once multiple cards are aggregated into one Actual account.
	return `${companyId}:${accountNumber ?? 'unknown'}:${idPart}`;
}

/**
 * Generates a unique reconciliation imported_id so a NEW txn is created every run.
 * (No update logic; no consolidation logic.)
 */
export function uniqueReconciliationImportedId(actualAccountId: string) {
	// Date-based + randomness to avoid collisions if multiple targets reconcile in the same second.
	const ts = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
	const rand = Math.random().toString(16).slice(2, 10);
	return `reconciliation-${actualAccountId}:${ts}:${rand}`;
}
