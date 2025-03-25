import {CompanyTypes, createScraper} from 'israeli-bank-scrapers';
import moment from 'moment';

const scraper = createScraper({
    companyId: CompanyTypes.visaCal,
    startDate: moment().subtract(1, 'year').toDate(),
})
const result = scraper.scrape({
    
})