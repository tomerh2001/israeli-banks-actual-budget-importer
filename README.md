# Israeli Banks → Actual Budget
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray)](https://github.com/xojs/xo)
[![Snyk Security](../../actions/workflows/snyk-security.yml/badge.svg)](../../actions/workflows/snyk-security.yml)
[![CodeQL](../../actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/tomerh2001/semantic-release-repo-template/badge)](https://securityscorecards.dev/viewer/?uri=github.com/tomerh2001/semantic-release-repo-template)

This project provides an importer from Israeli banks (via [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers)) into [Actual Budget](https://github.com/actualbudget/actual).

# Features
1. Supports all of the institutions that the [israeli-bank-scrapers](https://github.com/eshaham/israeli-bank-scrapers) library covers (Bank Hapoalim, Cal, Leumi, Discount, etc.).
1. Automatically **creates new Actual accounts** if none exist.
2. **Prevents duplicate transactions** using Actual’s [`imported_id`](https://actualbudget.org/docs/api/reference/#transactions) logic.
3. Configurable via a single JSON file specifying bank credentials, start dates, etc.
4. Automatically reconcile account balances.

> [!NOTE]  
> This importer is still WIP.

# Contributing
Feel free to open pull requests and issues! Suggestions or improvements are welcome.
