/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import moment from 'moment';
import type {ConfigBankTarget, AccountsSelector} from './config';

/**
 * Removes all properties with `undefined` values from an object.
 *
 * @template T - The type of the input object, which must extend Record<string, any>
 * @param {T} object - The object from which to remove undefined properties
 * @returns {T} A new object containing only the properties that had defined values
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: undefined, c: 'hello' };
 * const result = stripUndefined(obj);
 * // result: { a: 1, c: 'hello' }
 * ```
 */
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
/**
 * Normalizes bank target configuration into a standardized array of ConfigBankTarget objects.
 *
 * Supports two configuration formats:
 * - New format: Uses `targets[]` array with multiple target configurations
 * - Legacy format: Uses single `actualAccountId` and `reconcile` properties
 *
 * @param bank - The bank configuration object containing target information
 * @returns An array of normalized ConfigBankTarget objects. Returns empty array if no valid configuration is found.
 *
 * @remarks
 * - Filters out targets without an `actualAccountId`
 * - Defaults `reconcile` to `false` if not specified
 * - Legacy format automatically sets `accounts` selector to `'all'`
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

/**
 * Filters scraper accounts based on the provided selector.
 *
 * @param allAccounts - An array of account objects to filter from, or undefined
 * @param selector - The account selection criteria. Can be:
 *   - `undefined` or `'all'`: returns all accounts
 *   - An array of account numbers: returns only accounts matching the provided account numbers
 * @returns A filtered array of accounts matching the selector criteria. Returns an empty array if allAccounts is undefined.
 *
 * @example
 * ```typescript
 * // Returns all accounts
 * selectScraperAccounts(accounts, 'all');
 *
 * // Returns only accounts with matching account numbers
 * selectScraperAccounts(accounts, ['123456', '789012']);
 * ```
 */
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

/**
 * Generates a unique key for reconciliation targets based on account selection.
 *
 * The function prioritizes concrete account numbers from selected accounts for deterministic
 * key generation. If no account numbers are available, it falls back to using the selector.
 *
 * @param selector - The account selector which can be 'all', undefined, or an iterable of account identifiers
 * @param selectedAccounts - Array of account objects that may contain accountNumber properties
 *
 * @returns A string key representing the reconciliation target. Returns comma-separated account numbers
 *          if available, 'all' for undefined or 'all' selector, or comma-separated sorted selector values
 *          as fallback.
 *
 * @example
 * ```typescript
 * // Returns "123,456"
 * reconciliationTargetKey(undefined, [{ accountNumber: 456 }, { accountNumber: 123 }]);
 *
 * // Returns "all"
 * reconciliationTargetKey('all', []);
 *
 * // Returns "1,2,3"
 * reconciliationTargetKey([3, 1, 2], []);
 * ```
 */
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

/**
 * Generates a stable, deterministic identifier for an imported transaction.
 *
 * This function creates a unique ID that remains consistent across multiple imports
 * of the same transaction, enabling deduplication and idempotent imports.
 *
 * @param companyId - The identifier of the financial company/institution
 * @param accountNumber - The account number associated with the transaction (optional)
 * @param txn - The transaction object containing transaction details
 * @param txn.identifier - Optional scraper-provided unique identifier
 * @param txn.date - The transaction date
 * @param txn.chargedAmount - The charged amount for the transaction
 * @param txn.description - Optional transaction description
 * @param txn.memo - Optional transaction memo
 *
 * @returns A stable composite identifier in the format:
 *          `{companyId}:{accountNumber}:{identifier|dateAmountDescriptionMemo}`
 *          If no accountNumber is provided, 'unknown' is used as a fallback.
 *          If no scraper identifier exists, a deterministic composite of date, amount,
 *          description, and memo is used.
 *
 * @example
 * ```typescript
 * stableImportedId('bank123', '1234', {
 *   identifier: 'txn-456',
 *   date: '2024-01-15',
 *   chargedAmount: 100.50
 * });
 * // Returns: "bank123:1234:txn-456"
 *
 * stableImportedId('bank123', undefined, {
 *   date: '2024-01-15',
 *   chargedAmount: 100.50,
 *   description: 'Coffee Shop',
 *   memo: 'Morning coffee'
 * });
 * // Returns: "bank123:unknown:2024-01-15:100.50:Coffee Shop:Morning coffee"
 * ```
 */
export function stableImportedId(companyId: string, accountNumber: string | undefined, txn: any) {
	// Prefer scraper identifier if present; fall back to a deterministic composite.
	const idPart = txn?.identifier
		?? `${moment(txn?.date).format('YYYY-MM-DD')}:${txn?.chargedAmount}:${txn?.description ?? ''}:${txn?.memo ?? ''}`;

	// AccountNumber is important once multiple cards are aggregated into one Actual account.
	return `${companyId}:${accountNumber ?? 'unknown'}:${idPart}`;
}

/**
 * Generates a unique identifier for a reconciliation import.
 *
 * The ID is composed of three parts:
 * 1. A "reconciliation-" prefix followed by the account ID
 * 2. A timestamp in ISO 8601 format with milliseconds (YYYY-MM-DDTHH:mm:ss.SSS)
 * 3. A random 8-character hexadecimal string
 *
 * This format ensures uniqueness by combining temporal and random components,
 * preventing collisions when multiple reconciliations occur simultaneously.
 *
 * @param actualAccountId - The account ID to include in the reconciliation identifier
 * @returns A unique reconciliation import identifier in the format:
 *          `reconciliation-{accountId}:{timestamp}:{random}`
 *
 * @example
 * ```typescript
 * const id = uniqueReconciliationImportedId('account-123');
 * // Returns: "reconciliation-account-123:2024-01-15T14:30:45.123:a3f7c91d"
 * ```
 */
export function uniqueReconciliationImportedId(actualAccountId: string) {
	// Date-based + randomness to avoid collisions if multiple targets reconcile in the same second.
	const ts = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
	const rand = Math.random().toString(16).slice(2, 10);
	return `reconciliation-${actualAccountId}:${ts}:${rand}`;
}
