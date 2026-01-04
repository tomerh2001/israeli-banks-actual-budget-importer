import type {CompanyTypes} from 'israeli-bank-scrapers';
import type {ConfigBank} from '../config.js';

export type ScrapeTransactionsContext = {
	companyId: CompanyTypes;
	bank: ConfigBank;
};