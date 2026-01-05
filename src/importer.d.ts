import type {CompanyTypes} from 'israeli-bank-scrapers';
import type {ConfigBank} from '../config.js';

/**
 * Context object passed to transaction scraping functions.
 * 
 * @remarks
 * This type defines the required context information needed when scraping
 * transactions from Israeli banks. It includes both the company/institution
 * identifier and the specific bank configuration.
 * 
 * @property companyId - The type of financial company/institution being scraped
 * @property bank - The bank configuration containing credentials and settings
 */
export type ScrapeTransactionsContext = {
	companyId: CompanyTypes;
	bank: ConfigBank;
};