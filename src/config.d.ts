import type {InitConfig} from '@actual-app/api/@types/loot-core/server/main';
import type {ScraperCredentials, CompanyTypes} from 'israeli-bank-scrapers';

/**
 * Configuration object for the Israeli Banks Actual Budget Importer.
 *
 * @remarks
 * This type defines the top-level configuration structure required for the application.
 * It combines bank-specific settings and Actual Budget integration settings.
 *
 * @property banks - Configuration for Israeli bank connections and credentials
 * @property actual - Configuration for Actual Budget API connection and settings
 */
export type Config = {
	banks: ConfigBanks;
	actual: ConfigActual;
};

/**
 * Configuration object for the Actual Budget integration.
 *
 * @remarks
 * This type defines the structure for configuring the Israeli banks to Actual Budget importer.
 * It contains initialization settings and budget-specific configuration.
 *
 * @property init - Initialization configuration settings
 * @property budget - Budget-specific configuration for Actual Budget
 */
export type ConfigActual = {
	init: InitConfig;
	budget: ConfigActualBudget;
};

/**
 * Configuration object for connecting to and authenticating with Actual Budget.
 *
 * @property {string} syncId - The unique identifier used for synchronizing data with Actual Budget.
 * @property {string} password - The password or encryption key used to authenticate with Actual Budget.
 */
export type ConfigActualBudget = {
	syncId: string;
	password: string;
};

/**
 * Represents a partial mapping of company types to their respective bank configurations.
 *
 * @remarks
 * This type allows for optional configuration entries where not all company types
 * need to have a corresponding bank configuration defined. Each key is a company type
 * from the `CompanyTypes` enum/type, and each value is a `ConfigBank` object.
 *
 * @example
 * ```typescript
 * const banksConfig: ConfigBanks = {
 *   CompanyType1: { /* ConfigBank properties *\/ },
 *   CompanyType2: { /* ConfigBank properties *\/ }
 * };
 * ```
 */
export type ConfigBanks = Partial<Record<CompanyTypes, ConfigBank>>;
/**
 * Specifies which accounts should be selected for processing.
 *
 * @remarks
 * Can be either an array of specific account identifiers or the string 'all'
 * to select all available accounts.
 *
 * @example
 * ```typescript
 * // Select specific accounts
 * const selector: AccountsSelector = ['account1', 'account2'];
 *
 * // Select all accounts
 * const selector: AccountsSelector = 'all';
 * ```
 */
export type AccountsSelector = string[] | 'all';
/**
 * Determines the reconciliation behavior for imported transactions.
 *
 * @remarks
 * - `true`: Automatically reconcile all imported transactions
 * - `false`: Do not reconcile imported transactions
 * - `'consolidate'`: Consolidate and reconcile duplicate transactions
 */
export type ReconcileSelector = boolean | 'consolidate';

/**
 * A single "import target" inside Actual.
 * One target maps one Actual account to one or more scraped accounts/cards.
 */
/**
 * Configuration for a single target Actual Budget account and its associated scraped bank accounts.
 *
 * Defines how scraped transactions and balances should be imported into Actual Budget,
 * including which scraped accounts to include and whether to perform reconciliation.
 *
 * @example
 * ```typescript
 * const target: ConfigBankTarget = {
 *   actualAccountId: "account-123",
 *   reconcile: "consolidate",
 *   accounts: ["12345", "67890"]
 * };
 * ```
 */
export type ConfigBankTarget = {
	/**
	 * Actual Budget account ID to import into and (optionally) reconcile against.
	 */
	actualAccountId: string;

	/**
	 * If true, create/update a reconciliation transaction to match the scraped balance.
	 * If 'consolidate', reconcile once per Actual account using the consolidated balance
	 * across all selected scraped accounts.
	 * If false/undefined, do not reconcile.
	 */
	reconcile?: ReconcileSelector;

	/**
	 * Which scraped accounts (by accountNumber) should be included in this target.
	 * - "all": include all scraped accounts with usable data (final selection logic lives in code).
	 * - string[]: include only those accountNumbers.
	 *
	 * If omitted, default behavior should match legacy behavior:
	 * - treat as "all" for import, and for reconciliation use the first usable balance
	 *   (you'll refine this in the implementation files).
	 */
	accounts?: AccountsSelector;
};

/**
 * Bank config remains compatible with existing configs:
 * - Legacy: actualAccountId + reconcile at top level
 * - New: targets[]
 */
/**
 * Configuration for a single bank integration in the importer.
 *
 * Extends {@link ScraperCredentials} with bank-specific settings and import targets.
 * Supports both the new multi-target configuration and legacy single-target format
 * for backward compatibility.
 *
 * @remarks
 * The new preferred approach uses the `targets` array to define multiple import
 * destinations per bank. Legacy single-target fields (`actualAccountId` and `reconcile`)
 * are maintained for backward compatibility but should be ignored when `targets` is provided.
 *
 * @example
 * ```typescript
 * // New multi-target configuration
 * const config: ConfigBank = {
 *   ...credentials,
 *   targets: [
 *     { actualAccountId: "account1", reconcile: "selector1" },
 *     { actualAccountId: "account2", reconcile: "selector2" }
 *   ]
 * };
 *
 * // Legacy single-target configuration
 * const legacyConfig: ConfigBank = {
 *   ...credentials,
 *   actualAccountId: "account1",
 *   reconcile: "selector1"
 * };
 * ```
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
	reconcile?: ReconcileSelector;
};
