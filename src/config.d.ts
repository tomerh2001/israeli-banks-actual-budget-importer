import type {InitConfig} from '@actual-app/api/@types/loot-core/server/main';
import type {ScraperCredentials, CompanyTypes} from 'israeli-bank-scrapers';

export type Config = {
	banks: ConfigBanks;
	actual: ConfigActual;
};

export type ConfigActual = {
	init: InitConfig;
	budget: ConfigActualBudget;
};

export type ConfigActualBudget = {
	syncId: string;
	password: string;
};

export type ConfigBanks = Partial<Record<CompanyTypes, ConfigBank>>;

/**
 * A single "import target" inside Actual.
 * One target maps one Actual account to one or more scraped accounts/cards.
 */
export type ConfigBankTarget = {
	/**
	 * Actual Budget account ID to import into and (optionally) reconcile against.
	 */
	actualAccountId: string;

	/**
	 * If true, create/update a reconciliation transaction to match the scraped balance.
	 */
	reconcile?: boolean;

	/**
	 * Which scraped accounts (by accountNumber) should be included in this target.
	 * - "all": include all scraped accounts with usable data (final selection logic lives in code).
	 * - string[]: include only those accountNumbers.
	 *
	 * If omitted, default behavior should match legacy behavior:
	 * - treat as "all" for import, and for reconciliation use the first usable balance
	 *   (you'll refine this in the implementation files).
	 */
	accounts?: 'all' | string[];
};

/**
 * Bank config remains compatible with existing configs:
 * - Legacy: actualAccountId + reconcile at top level
 * - New: targets[]
 */
export type ConfigBank = ScraperCredentials & {
	/**
	 * New preferred configuration: one bank can have multiple import targets.
	 */
	targets?: ConfigBankTarget[];

	/**
	 * Legacy single-target fields (backward compatible).
	 * If targets is provided, these should be ignored by runtime logic.
	 */
	actualAccountId?: string;
	reconcile?: boolean;
};
