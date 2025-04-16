# Base stage for common settings
FROM ghcr.io/puppeteer/puppeteer:latest AS base
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install

# Builder stage
FROM dependencies AS builder
COPY src/ src/

# Final stage for production
FROM builder AS release
CMD yarn start
