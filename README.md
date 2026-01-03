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

5. **Credit Card / Multi-Account Mapping (Targets):** Supports mapping multiple scraped accounts/cards into one Actual account, or mapping each scraped card into its own Actual account (via `targets` and `accounts`).

6. **Concurrent Processing:** Uses a queue (via [p-queue](https://www.npmjs.com/package/p-queue)) to manage scraping tasks concurrently.

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

The application configuration is defined using JSON and validated against a schema.
The main configuration file is `config.json`.

The configuration has **two independent top-level sections**:
1. `actual`: Configures the Actual Budget connection.
2. `banks`: Configures bank scrapers and account mappings.

---

### 1) `actual` configuration

This section configures the connection to your Actual Budget server and budget.
It is **always required**, regardless of how you configure banks or targets.

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
  }
}
```

Nothing in this block changes when using `targets`, credit cards, or multi-account mappings.

---

### 2) `banks` configuration

The `banks` section defines:
- Which banks to scrape
- The credentials for each bank
- How scraped accounts/cards are mapped into Actual accounts

Each bank entry includes the credentials required by `israeli-bank-scrapers`
(e.g. `userCode`, `username`, `password`, etc.) and supports **multiple mapping modes**.

#### Using `targets` (recommended)

A single bank scrape (for example `visaCal`) may return **multiple accounts/cards**.
Different users model these differently in Actual, so the importer supports `targets`.

Each **target** represents:
- One Actual account
- One or more scraped accounts/cards that feed into it

For each target:
- Imported transactions = concatenation of transactions from selected cards
- Reconciliation (if enabled) = sum of balances of selected cards
  (only cards with a valid numeric balance are included)

---

#### Example A: One Actual account for all VisaCal cards (consolidated)

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
    "visaCal": {
      "username": "bank_username",
      "password": "bank_password",
      "targets": [
        {
          "actualAccountId": "actual-creditcards-all",
          "reconcile": true,
          "accounts": "all"
        }
      ]
    }
  }
}
```

---

#### Example B: One Actual account per VisaCal card (separate accounts)

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
    "visaCal": {
      "username": "bank_username",
      "password": "bank_password",
      "targets": [
        {
          "actualAccountId": "actual-card-8538",
          "reconcile": true,
          "accounts": ["8538"]
        },
        {
          "actualAccountId": "actual-card-7697",
          "reconcile": true,
          "accounts": ["7697"]
        }
      ]
    }
  }
}
```

---

#### Example C: Grouped cards into a single Actual account (subset)

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
    "visaCal": {
      "username": "bank_username",
      "password": "bank_password",
      "targets": [
        {
          "actualAccountId": "actual-cal-primary",
          "reconcile": true,
          "accounts": ["8538", "7697"]
        }
      ]
    }
  }
}
```

---

## Legacy configuration (single Actual account per bank)

This configuration style is **fully supported for backward compatibility**,
but does **not** allow fine-grained control over multiple cards/accounts.

It maps all scraped accounts from the bank into a single Actual account.

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
  }
}
```

---

## Notes

- The `actual` block is **always required** and independent of bank configuration.
- `targets` are optional but strongly recommended for credit-card providers.
- Duplicate transactions are prevented using a stable `imported_id`.
- Credit card balances are often negative; reconciliation uses the values as returned by the bank.

## License

This project is open-source. Please see the [LICENSE](./LICENSE) file for licensing details.

## Acknowledgments

- **israeli-bank-scrapers:** Thanks to the contributors of the bank scraper libraries.
- **Actual App:** For providing a powerful budgeting API.
- **Open-source Community:** Your support and contributions are appreciated.
