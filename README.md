# Israeli Banks Actual Budget Importer

This project automates the process of importing actual budget data from various Israeli banks. It utilizes [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers) for scraping bank transactions and [@actual-app/api](https://github.com/actualbudget/actual-app) to integrate these transactions into the Actual budgeting system.

## Table of Contents

- [Israeli Banks Actual Budget Importer](#israeli-banks-actual-budget-importer)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation](#installation)
    - [Docker](#docker)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Configuration](#configuration)
    - [Configuration Structure](#configuration-structure)
  - [Usage](#usage)
  - [Development](#development)
    - [Project Structure](#project-structure)
    - [TypeScript \& Linting](#typescript--linting)
  - [Testing \& Linting](#testing--linting)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Overview

The **Israeli Banks Actual Budget Importer** is a Node.js project written in TypeScript designed to:

- **Scrape transactions** using specialized bank scrapers.
- **Import transactions** into the Actual budgeting system.
- **Perform account reconciliation** by computing and importing balance differences.
- **Facilitate scheduled imports** by managing concurrent scraping tasks with a queue.

The main logic is found in `src/index.ts`, which initializes the Actual API, triggers the scraping process, imports transactions, and then gracefully shuts down.

## Features

- **Multi-Bank Support:** Configurable support for various Israeli banks.
- **Transaction Scraping:** Uses [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers) to obtain recent transaction data.
- **Budget Integration:** Imports scraped data into the Actual budgeting application using [@actual-app/api](https://github.com/actualbudget/actual-app).
- **Concurrent Processing:** Uses a queue (via [p-queue](https://www.npmjs.com/package/p-queue)) to manage scraping tasks concurrently.
- **Reconciliation:** Optional reconciliation to adjust account balances automatically.
- **Typed Configurations:** Utilizes JSON schemas and TypeScript types to ensure configuration consistency.

## Installation

### Docker
Soon.

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
