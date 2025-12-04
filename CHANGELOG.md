# [1.7.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.6.1...v1.7.0) (2025-12-04)


### Features

* add logging for first 5 scraped transactions ([47dc4e9](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/47dc4e956395edcddc3779fe252bc15b9ce9d3ca))

## [1.6.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.6.0...v1.6.1) (2025-12-04)


### Bug Fixes

* update transaction notes to use memo instead of status ([1483fdb](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/1483fdbd35c2e23106ab561926df79797c5b09f8))

# [1.6.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.5.3...v1.6.0) (2025-12-02)


### Features

* enhance reconciliation process ([5ebf9a6](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/5ebf9a6453aa8db1e6f23fd81d114fbef5c85e5c))

## [1.5.3](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.5.2...v1.5.3) (2025-11-24)


### Bug Fixes

* update Node.js version to 24 and adjust file permissions ([a4a2658](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/a4a2658537057f4a5a8a4c1888791b94ec987577))
* Updated packages to latest version ([91c3f6b](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/91c3f6bf57cbbc2a9f17925d13a393ebd9746510))

## [1.5.2](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.5.1...v1.5.2) (2025-06-09)


### Bug Fixes

* bumped israeli-bank-scrapers to v6.1.3 ([15ed7c4](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/15ed7c490035837327e69c4372595c918cfea44c))

## [1.5.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.5.0...v1.5.1) (2025-05-28)


### Bug Fixes

* comment out executablePath in scraper configuration ([6f9ac7d](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/6f9ac7dc478cf06edebc90a003fb43d6083717b5))

# [1.5.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.4.0...v1.5.0) (2025-05-24)


### Bug Fixes

* update scraper configuration for executable path and user data directory ([7227ac4](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/7227ac40be5c50c2e8bf95e201af1f260478846c))


### Features

* improved the logs ([3a5f1ac](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/3a5f1aca53be85413225c9e0e75df29cbd70cf91))

# [1.4.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.3.1...v1.4.0) (2025-05-24)


### Features

* improved the logs ([8ca8c61](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/8ca8c616a394501412262243e98e535a9bace6ad))

## [1.3.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.3.0...v1.3.1) (2025-05-23)


### Bug Fixes

* ensure graceful shutdown with timeout in scheduled run ([49bc74f](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/49bc74f0e631da2f4407bdd0aae9b105f165b134))
* ensure graceful shutdown with timeout in scheduled run ([ccd946c](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/ccd946c52181a939abd044ce443acafc18319b82))

# [1.3.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.5...v1.3.0) (2025-05-23)


### Bug Fixes

* update schedule environment variable for periodic imports in docker compose ([82344ef](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/82344ef9d4a4629af884bd8adb87c7cbac87628d))


### Features

* add cron scheduling support for periodic imports and update dependencies ([03fc0c3](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/03fc0c3cee132ab7c513e0547337e5dcce590914))

## [1.2.5](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.4...v1.2.5) (2025-05-12)


### Bug Fixes

* import process module and update scraper options for verbosity and browser visibility ([885ff4e](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/885ff4e68d41c0d7b89039da09cd551e37fb1568))

## [1.2.4](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.3...v1.2.4) (2025-05-12)


### Bug Fixes

* comment out build configuration in docker-compose and executablePath in utils ([d33865f](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/d33865f503600b3fd7021732bc0fbb1517ab4ee7))

## [1.2.3](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.2...v1.2.3) (2025-05-12)


### Bug Fixes

* add @semantic-release/github plugin to release configuration ([571127a](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/571127a8029ff5783c190bb699f1c19a4c9bcd7b))

## [1.2.2](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.1...v1.2.2) (2025-05-12)


### Bug Fixes

* remove dockerBuildQuiet and dockerBuildFlags from semantic-release-docker configuration ([66be0eb](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/66be0ebf1db2a728662e07e70df4991920485b0c))

## [1.2.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.0...v1.2.1) (2025-05-12)


### Bug Fixes

* add dockerBuildFlags configuration to semantic-release-docker plugin ([49c0b58](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/49c0b58ee7204745b64693da958a248f3bfe8155))
* add newline at end of .releaserc file ([d28f51d](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/d28f51d18b84c868c35ee4681abc5d6f51b2910a))
* comment out ghcr.io authentication step and update semantic-release-docker plugin configuration ([a5f389c](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/a5f389c52649b99f2db0f0b5293144178c968549))
* correct casing of 'executablePath' in scraper configuration ([b122168](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b1221688ae0f9912b8d51f4a42e2f7ff57349443))
* remove ghcr.io authentication step from workflow ([421853b](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/421853bbaa03faa67436aa08954ce3b8e1467baa))
* replace immediate process exit with delayed exit using setTimeout ([9751cea](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/9751cea84c250d0946e0f15106b46904f7cbd23a))
* update dependencies and add semantic-release-docker plugin ([83257aa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/83257aa2e342accac105d9f38fe854e4942bcec5))
* update permissions for BuildKit to ensure writable access ([9232656](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/92326568e347c497d5b4cff37ce58adf72189eed))
* update semantic-release-docker plugin configuration to disable quiet mode ([590b210](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/590b2101b4bb7c21d30fd513b2fac9c05cab8967))

## [1.2.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.0...v1.2.1) (2025-05-12)


### Bug Fixes

* add dockerBuildFlags configuration to semantic-release-docker plugin ([49c0b58](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/49c0b58ee7204745b64693da958a248f3bfe8155))
* add newline at end of .releaserc file ([d28f51d](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/d28f51d18b84c868c35ee4681abc5d6f51b2910a))
* comment out ghcr.io authentication step and update semantic-release-docker plugin configuration ([a5f389c](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/a5f389c52649b99f2db0f0b5293144178c968549))
* correct casing of 'executablePath' in scraper configuration ([b122168](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b1221688ae0f9912b8d51f4a42e2f7ff57349443))
* replace immediate process exit with delayed exit using setTimeout ([9751cea](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/9751cea84c250d0946e0f15106b46904f7cbd23a))
* update dependencies and add semantic-release-docker plugin ([83257aa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/83257aa2e342accac105d9f38fe854e4942bcec5))
* update semantic-release-docker plugin configuration to disable quiet mode ([590b210](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/590b2101b4bb7c21d30fd513b2fac9c05cab8967))

## [1.2.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.0...v1.2.1) (2025-05-12)


### Bug Fixes

* add newline at end of .releaserc file ([d28f51d](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/d28f51d18b84c868c35ee4681abc5d6f51b2910a))
* comment out ghcr.io authentication step and update semantic-release-docker plugin configuration ([a5f389c](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/a5f389c52649b99f2db0f0b5293144178c968549))
* correct casing of 'executablePath' in scraper configuration ([b122168](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b1221688ae0f9912b8d51f4a42e2f7ff57349443))
* replace immediate process exit with delayed exit using setTimeout ([9751cea](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/9751cea84c250d0946e0f15106b46904f7cbd23a))
* update dependencies and add semantic-release-docker plugin ([83257aa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/83257aa2e342accac105d9f38fe854e4942bcec5))

## [1.2.1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.2.0...v1.2.1) (2025-05-12)


### Bug Fixes

* correct casing of 'executablePath' in scraper configuration ([b122168](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b1221688ae0f9912b8d51f4a42e2f7ff57349443))
* replace immediate process exit with delayed exit using setTimeout ([9751cea](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/9751cea84c250d0946e0f15106b46904f7cbd23a))
* update dependencies and add semantic-release-docker plugin ([83257aa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/83257aa2e342accac105d9f38fe854e4942bcec5))

# [1.2.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.1.0...v1.2.0) (2025-04-16)


### Bug Fixes

* replace bunx with yarn for semantic release command ([1c15afa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/1c15afa2f0b4aa2247538ff0273b97639bac9f32))
* specify Node.js version to 21 in workflow ([5f8c3db](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/5f8c3db7b8d055e2d5b11acee3f9b45d5ef621b3))
* update Docker image tag to use latest version in compose file ([e43a3b1](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/e43a3b11e2271818f00f55a985c363c9a2fe4d5f))
* update workflow to use yarn for dependency installation and setup Node environment ([b0e797f](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b0e797fdcbefb6390e85ccecaf598d37d67f9f04))


### Features

* Added docker support ([aff5c85](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/aff5c8559f194a44c4c29f8ee1cd24f89fb11f62))

# [1.2.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.1.0...v1.2.0) (2025-04-16)


### Bug Fixes

* replace bunx with yarn for semantic release command ([1c15afa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/1c15afa2f0b4aa2247538ff0273b97639bac9f32))
* specify Node.js version to 21 in workflow ([5f8c3db](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/5f8c3db7b8d055e2d5b11acee3f9b45d5ef621b3))
* update workflow to use yarn for dependency installation and setup Node environment ([b0e797f](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b0e797fdcbefb6390e85ccecaf598d37d67f9f04))


### Features

* Added docker support ([aff5c85](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/aff5c8559f194a44c4c29f8ee1cd24f89fb11f62))

# [1.2.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.1.0...v1.2.0) (2025-04-16)


### Bug Fixes

* replace bunx with yarn for semantic release command ([1c15afa](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/1c15afa2f0b4aa2247538ff0273b97639bac9f32))
* update workflow to use yarn for dependency installation and setup Node environment ([b0e797f](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/b0e797fdcbefb6390e85ccecaf598d37d67f9f04))


### Features

* Added docker support ([aff5c85](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/aff5c8559f194a44c4c29f8ee1cd24f89fb11f62))

# [1.2.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.1.0...v1.2.0) (2025-04-16)


### Features

* Added docker support ([aff5c85](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/aff5c8559f194a44c4c29f8ee1cd24f89fb11f62))

# [1.1.0](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.0.0...v1.1.0) (2025-04-09)


### Features

* add imported_id field for transaction importing to prevent duplicates ([bb302fb](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/bb302fbfc898644ae276863407e59fda2319edbd))

# 1.0.0 (2025-04-09)


### Bug Fixes

* **initial-commit:** restructure project files and update dependencies ([ad1abcf](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/ad1abcf4e405f2356342b684fff3773a92b3b4ce))
# [1.0.0-beta.2](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2025-04-09)


### Features

* add imported_id field for transaction importing to prevent duplicates ([bb302fb](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/bb302fbfc898644ae276863407e59fda2319edbd))

# 1.0.0-beta.1 (2025-03-24)


### Bug Fixes

* **initial-commit:** restructure project files and update dependencies ([ad1abcf](https://github.com/tomerh2001/israeli-banks-actual-budget-importer/commit/ad1abcf4e405f2356342b684fff3773a92b3b4ce))
