import type {ScraperCredentials, CompanyTypes} from 'israeli-bank-scrapers';
import type actual from '@actual-app/api';
import {type ConfigBank} from '../config.js';

export type ScrapeTransactionsContext = {
	companyId: CompanyTypes;
	bank: ConfigBank;
};
