# Semantic Release Repo Template
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray)](https://github.com/xojs/xo)
[![Snyk Security](../../actions/workflows/snyk-security.yml/badge.svg)](../../actions/workflows/snyk-security.yml)
[![CodeQL](../../actions/workflows/codeql.yml/badge.svg)](../../actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/tomerh2001/semantic-release-repo-template/badge)](https://securityscorecards.dev/viewer/?uri=github.com/tomerh2001/semantic-release-repo-template)

# Configuration
> [!NOTE]
> Go to [Repository Secrets](../../settings/secrets/actions) settings and add the following:

| Name                      | Description                                | Required |
| ------------------------- | ------------------------------------------ | -------- |
| GH_TOKEN                  | Github Token                               | Yes      |
| NPM_TOKEN                 | NPM Token for publishing to NPM from CI/CD | Recommended |
| CODECOV_TOKEN             | Codecov Token for coverage tests | Recommended |
| SNYK_TOKEN                | Snyk Token for security tests    | Recommended |
| DOCKER_REGISTRY_USER      | Docker registry user             | Optional    |
| DOCKER_REGISTRY_PASSWORD  | Docker registry password         | Optional
