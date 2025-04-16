# Israeli Banks → Actual Budget
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray)](https://github.com/xojs/xo)
[![Snyk Security](../../actions/workflows/snyk-security.yml/badge.svg)](../../actions/workflows/snyk-security.yml)
[![CodeQL](../../actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://www.bestpractices.dev/projects/10403/badge)](https://www.bestpractices.dev/projects/10403)

This project provides an importer from Israeli banks (via [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers)) into [Actual Budget](https://github.com/actualbudget/actual).

## Table of Contents

- [Israeli Banks → Actual Budget](#israeli-banks--actual-budget)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
    - [Docker](#docker)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Configuration](#configuration)
    - [Configuration Structure](#configuration-structure)
  - [Usage](#usage)
  - [Development](#development)
    - [Overview](#overview)
    - [Project Structure](#project-structure)
    - [TypeScript \& Linting](#typescript--linting)
  - [Testing \& Linting](#testing--linting)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Features

1. **Multi Bank Support**: Supports all of the institutions that the [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers) library covers (Bank Hapoalim, Cal, Leumi, Discount, etc.).

2. **Prevents duplicate transactions** using Actual’s [`imported_id`](https://actualbudget.org/docs/api/reference/#transactions) logic.

3. **Automatic Account Creation**: If the bank account does not exist in Actual, it will be created automatically.

4. **Reconciliation:** Optional reconciliation to adjust account balances automatically.

5. **Concurrent Processing:** Uses a queue (via [p-queue](https://www.npmjs.com/package/p-queue)) to manage scraping tasks concurrently.

## Installation

### Docker
https://hub.docker.com/r/tomerh2001/israeli-banks-actual-budget-importer

### Prerequisites

- **Node.js:** Make sure you have Node.js installed (a version that supports ES modules is recommended).
- **Yarn:** This project uses Yarn as its package manager. Ensure Yarn is installed.
- **TypeScript:** Installed via dependencies.

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/tomerh2001/israeli-banks-actual-budget-importer.git
   cd israeli-banks-actual-budget-importer
   ```

2. **Install Dependencies:**

   ```bash
   yarn install
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

## Usage

The project comes with scripts configured in the `package.json`. To start the importer:

```bash
yarn start
```

This command runs the script defined as:

```json
"start": "tsx src/index.ts"
```

It initializes the connection to the Actual API, downloads the budget, scrapes bank transactions, imports them, and if enabled, performs reconciliation. After processing all tasks in the queue, the application shuts down cleanly.

## Development

### Overview

The **Israeli Banks Actual Budget Importer** is a Node.js project written in TypeScript designed to:

- **Scrape transactions** using specialized bank scrapers.
- **Import transactions** into the Actual budgeting system.
- **Perform account reconciliation** by computing and importing balance differences.
- **Facilitate scheduled imports** by managing concurrent scraping tasks with a queue.

The main logic is found in `src/index.ts`, which initializes the Actual API, triggers the scraping process, imports transactions, and then gracefully shuts down.


### Project Structure

- **src/**  
  Contains the TypeScript source code.
  - `index.ts`: Entry point.
  - `utils.ts`: Utility functions for scraping and importing transactions.
  - `config.d.ts`, `utils.d.ts`: Type definitions.

- **config.schema.json:**  
  JSON schema to validate your configuration file.

- **package.json:**  
  Lists the dependencies, scripts, and project metadata.

- **.github, .vscode:**  
  Contain CI/CD and editor-specific settings.

### TypeScript & Linting

The project uses [XO](https://github.com/xojs/xo) for linting. Ensure you follow coding styles as enforced by XO.

## Testing & Linting

Run tests and linting with the following command:

```bash
yarn test
```

Ensure that your changes pass linting rules and tests before submitting any pull requests.

## Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository:** Create your own fork and clone it locally.
2. **Create a New Branch:** Use descriptive branch names (e.g., `feature/new-scraper-support`).
3. **Commit Your Changes:** Follow the commit message guidelines, especially if you are using semantic release.
4. **Submit a Pull Request:** Ensure your code passes all tests and linting checks.

Please also review our [CHANGELOG.md](./CHANGELOG.md) and [SECURITY.md](./SECURITY.md) for more context on versioning and security practices.

## License

This project is open-source. Please see the [LICENSE](./LICENSE) file for licensing details.

## Acknowledgments

- **israeli-bank-scrapers:** Thanks to the contributors of the bank scraper libraries.
- **Actual App:** For providing a powerful budgeting API.
- **Open-source Community:** Your support and contributions are appreciated.
