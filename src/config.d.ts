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

export type ConfigBank = ScraperCredentials & {
	actualAccountId: string;
	reconcile?: boolean;
};
