# Israeli Banks → Actual Budget
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray)](https://github.com/xojs/xo)
[![Snyk Security](../../actions/workflows/snyk-security.yml/badge.svg)](../../actions/workflows/snyk-security.yml)
[![CodeQL](../../actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://www.bestpractices.dev/projects/10403/badge)](https://www.bestpractices.dev/projects/10403)

This project provides an importer from Israeli banks (via [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers)) into [Actual Budget](https://github.com/actualbudget/actual).

## Features

1. **Multi Bank Support**: Supports all of the institutions that the [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers) library covers (Bank Hapoalim, Cal, Leumi, Discount, etc.).

2. **Prevents duplicate transactions** using Actual’s [`imported_id`](https://actualbudget.org/docs/api/reference/#transactions) logic.

3. **Automatic Account Creation**: If the bank account does not exist in Actual, it will be created automatically.

4. **Reconciliation:** Optional reconciliation to adjust account balances automatically.

5. **Concurrent Processing:** Uses a queue (via [p-queue](https://www.npmjs.com/package/p-queue)) to manage scraping tasks concurrently.

## Installation

### Docker
https://hub.docker.com/r/tomerh2001/israeli-banks-actual-budget-importer
#### Example
```yml
services:
  importer:
    image: tomerh2001/israeli-banks-actual-budget-importer:latest
    restart: always
    cap_add:
      - SYS_ADMIN
    environment:
      - TZ=Asia/Jerusalem
      - SCHEDULE=0 0 * * * # Optional (Used to run periodically - remove to run once)
    volumes:
      - ./config.json:/app/config.json
      - ./cache:/app/cache # Optional
      - ./chrome-data:/app/chrome-data # Optional (Used to solve 2FA issues like with hapoalim)
```

## Configuration

The application configuration is defined using JSON and validated against a schema. The key configuration file is `config.json` and its schema is described in `config.schema.json`.

### Configuration Structure

- **actual:**  
  Contains settings for the Actual API integration:
  - `init`: Initialization parameters (e.g., server URL, password).
  - `budget`: Contains properties like `syncId` and `password` for synchronizing budgets.

- **banks:**  
  Defines bank-specific settings for each supported bank. Each entry typically requires:
  - `actualAccountId`: The account identifier in Actual.
  - `password`: The bank account password.
  - Additional properties (e.g., `userCode`, `username`, or other bank-specific credentials) as required.
  - `reconcile` (optional): A flag to enable balance reconciliation.

Make sure your `config.json` follows the schema defined in `config.schema.json`.

Example snippet:

```json
{
  "actual": {
    "init": {
      "dataDir": "./data",
      "password": "your_actual_password",
      "serverURL": "https://your-actual-server.com"
    },
    "budget": {
      "syncId": "your_sync_id",
      "password": "your_budget_password"
    }
  },
  "banks": {
    "hapoalim": {
      "actualAccountId": "account-123",
      "userCode": "bank_user",
      "password": "bank_password",
      "reconcile": true
    },
    "leumi": {
      "actualAccountId": "account-456",
      "username": "bank_username",
      "password": "bank_password"
    }
    // Additional bank configurations go here...
  }
}
```

## License

This project is open-source. Please see the [LICENSE](./LICENSE) file for licensing details.

## Acknowledgments

- **israeli-bank-scrapers:** Thanks to the contributors of the bank scraper libraries.
- **Actual App:** For providing a powerful budgeting API.
- **Open-source Community:** Your support and contributions are appreciated.
