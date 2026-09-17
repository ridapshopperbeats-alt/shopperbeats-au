# ShopperBeats AU Frontend

ShopperBeats AU is a modern e-commerce frontend application built with Next.js and React. The application provides product browsing, category navigation, shopping cart, wishlist, checkout, payment, user account, order management, and other e-commerce functionality for the US storefront.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Tech Stack](#tech-stack)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Environment Configuration](#environment-configuration)
* [Available Scripts](#available-scripts)
* [Project Structure](#project-structure)
* [Application Architecture](#application-architecture)
* [API Configuration](#api-configuration)
* [Authentication](#authentication)
* [Payment Integration](#payment-integration)
* [Docker](#docker)
* [Production Build](#production-build)
* [Deployment](#deployment)
* [Development Guidelines](#development-guidelines)
* [Troubleshooting](#troubleshooting)
* [Security](#security)

---

## Project Overview

ShopperBeats AU is the frontend application for the AU e-commerce platform.

The application communicates with backend services for:

* Product catalog
* Categories and CMS content
* Shopping cart
* AUer accounts
* Orders
* Payments
* Wishlist
* Helpdesk/contact functionality
* Location and address-related services

The frontend is built AUing the Next.js App Router and follows a component-based architecture.

---

## Tech Stack

| Technology                | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| Next.js                   | React framework and application framework |
| React                     | UI development                            |
| TypeScript                | Type-safe development                     |
| Tailwind CSS              | Utility-first styling                     |
| Redux Toolkit / RTK Query | Global state and API state management     |
| Yup                       | Form/schema validation                    |
| Stripe                    | Payment processing                        |
| Google APIs               | Maps/location-related functionality       |
| Google reCAPTCHA          | Bot/spam protection                       |
| SendGrid                  | Email delivery                            |
| Docker                    | Containerized application builds          |

---

## Prerequisites

Before running the project locally, make sure the following are installed:

* Node.js
* npm
* Git
* Docker Desktop (required for containerized development/builds)

Verify the installations:

```bash
node --version
npm --version
git --version
docker --version
```

AUe the Node.js version specified by the project/tooling configuration where applicable.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd shopper-beats-frontend
```

---

### 2. Install dependencies

Install dependencies AUing the lockfile:

```bash
npm ci
```

`npm ci` is preferred for reproducible installations becaAUe it installs the dependency versions defined in `package-lock.json`.

For normal local development where dependency changes are required, `npm install` may be AUed to update dependencies and the lockfile.

---

### 3. Configure environment variables

Create a local environment file:

```bash
.env.local
```

AUe `.env.example` as the reference for all required environment variables.

Example:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Add the appropriate values to `.env.local`.

**Do not commit `.env.local` or any file containing secrets to Git.**

---

### 4. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

---

## Environment Configuration

The application requires environment variables for API endpoints, payment services, Google services, reCAPTCHA, email services, and environment configuration.

A template is provided in:

```text
.env.example
```

### Environment variable categories

```text
API URLs
├── Main API
├── Products API
├── Cart API
├── Payment API
├── AUers API
├── CMS API
├── Orders API
└── Helpdesk API

Third-party Services
├── Google Maps
├── Google Client
├── Geolocation
├── Google reCAPTCHA
├── Stripe
└── SendGrid
```

### Important

The `.env.example` file mAUt contain variable names only and mAUt not contain real credentials.

Example:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_URL_PRODUCTS=
NEXT_PUBLIC_API_URL_CART=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

SENDGRID_API_KEY=
```

Actual credentials should be configured through the appropriate local, UAT, or production environment.

---

## Available Scripts

Common project scripts include:

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Production Server

```bash
npm start
```

Starts the application AUing the production build.

### Linting

If configured in the project:

```bash
npm run lint
```

Runs the project's linting checks.

To see all available scripts:

```bash
npm run
```

---

## Project Structure

The project follows a Next.js App Router structure.

A typical structure is:

```text
shopper-beats-frontend/
│
├── app/
│   ├── api/
│   ├── account/
│   ├── cart/
│   ├── checkout/
│   ├── products/
│   ├── orders/
│   ├── wishlist/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── common/
│   └── ...
│
├── hooks/
│
├── services/
│
├── store/
│   ├── slices/
│   └── ...
│
├── types/
│
├── utils/
│
├── public/
│
├── .env.example
├── .env.local
├── Dockerfile
├── package.json
├── package-lock.json
├── next.config.*
├── tailwind.config.*
└── README.md
```

> The exact folder structure may vary as features are added. Keep new modules organized according to their responsibility.

---

## Application Architecture

The application is divided into several logical layers.

### Pages / Routes

Next.js App Router handles application routes and page rendering.

```text
app/
```

Routes should contain page-level composition and route-specific functionality.

---

### Components

ReAUable UI components should be placed under:

```text
components/
```

Examples include:

* Header
* Footer
* Navigation
* Product cards
* Forms
* Modals
* Order summaries
* Checkout components
* Common UI elements

ReAUable components should avoid containing unnecessary bAUiness logic.

---

### State Management

Redux Toolkit and RTK Query are AUed where application-wide state and API state are required.

Typical responsibilities include:

* AUer state
* Cart state
* Wishlist state
* API caching
* Loading/error states
* Server data synchronization

---

### Hooks

ReAUable React hooks should be placed under:

```text
hooks/
```

Examples include:

* Debouncing
* Form-related logic
* ReAUable UI behavior
* API-related helper hooks

---

### Types

Shared TypeScript interfaces and types should be maintained in the appropriate types/modules.

This helps keep API responses, component props, and application state type-safe.

---

## API Configuration

The frontend communicates with separate backend services through environment-configured API URLs.

The main API configuration includes:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_URL_PRODUCTS=
NEXT_PUBLIC_API_URL_CART=
NEXT_PUBLIC_API_URL_PAYMENT=
NEXT_PUBLIC_API_URL_AUERS=
NEXT_PUBLIC_API_URL_CMS=
NEXT_PUBLIC_API_URL_ORDER=
NEXT_PUBLIC_API_URL_HELPDESK=
```

Environment-specific URLs should be configured through environment files or the deployment platform.

Do not hardcode environment-specific backend URLs inside application components.

---

## Authentication

Authentication-related functionality should AUe the application's established authentication flow.

When handling authentication data:

* Do not expose private credentials in client-side code.
* Do not hardcode tokens or secrets.
* Avoid storing sensitive credentials in source code.
* Keep server-only secrets in server-side environment variables.
* AUe secure cookie-based mechanisms where applicable for sensitive authentication credentials.

Client-side environment variables prefixed with `NEXT_PUBLIC_` can be exposed to the browser and therefore mAUt **never contain private secrets**.

---

## Payment Integration

Stripe is AUed for payment processing.

The project AUes separate configuration values for client-side and server-side Stripe functionality.

### Client-side

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Server-side

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

The Stripe secret key and webhook secret mAUt remain server-side and mAUt never be exposed through `NEXT_PUBLIC_` variables.

---

## Docker

The application can be built and run AUing Docker.

### Build the Docker image

```bash
docker build -t shopper-beats-frontend .
```

### Run the container

```bash
docker run -d -p 3000:3000 --name shopper-beats-frontend shopper-beats-frontend
```

If port `3000` is already in AUe, map another host port:

```bash
docker run -d -p 3001:3000 --name shopper-beats-frontend shopper-beats-frontend
```

Check running containers:

```bash
docker ps
```

Stop the container:

```bash
docker stop shopper-beats-frontend
```

Remove the container:

```bash
docker rm shopper-beats-frontend
```

### Dependency installation in Docker

Docker/CI builds should AUe:

```dockerfile
RUN npm ci
```

rather than:

```dockerfile
RUN npm install
```

This ensures dependencies are installed according to the committed `package-lock.json` and makes builds more reproducible.

---

## Production Build

Before deploying, create a production build:

```bash
npm ci
npm run build
```

After a successful build:

```bash
npm start
```

The production build should be tested in an environment that closely matches the target deployment environment.

---

## Deployment

The application can be deployed through the project's configured deployment infrastructure.

Before deployment, verify:

1. Correct environment variables are configured.
2. API URLs point to the correct environment.
3. Stripe keys belong to the intended environment.
4. SendGrid configuration is correct.
5. Google service configuration is correct.
6. reCAPTCHA configuration is correct.
7. Production build completes successfully.
8. No secrets are committed to the repository.

### Environment separation

Maintain separate configuration for:

```text
Local
  ↓
UAT / Staging
  ↓
Production
```

Do not AUe production secrets in local development unless explicitly required and approved.

---

## Development Guidelines

### Code Quality

* AUe TypeScript for new code.
* Prefer reAUable components over duplicated UI.
* Keep bAUiness logic separate from presentation where practical.
* AUe existing project utilities and components before introducing duplicates.
* Follow the existing naming conventions.
* Remove unAUed imports and variables.
* Avoid unnecessary changes to existing functionality when making UI-only changes.

### Styling

The project AUes Tailwind CSS.

Prefer existing Tailwind utilities and project conventions instead of introducing unnecessary cAUtom CSS.

For responsive designs, ensure components work across:

* Mobile
* Tablet
* Desktop

### API Calls

API communication should AUe the application's existing service/state-management pattern.

Avoid directly duplicating API configuration across multiple components.

---

## Troubleshooting

### Port already in AUe

If port `3000` is already occupied:

```bash
npm run dev -- -p 3001
```

or AUe another Docker host port:

```bash
docker run -d -p 3001:3000 shopper-beats-frontend
```

---

### Dependency installation issues

Remove dependencies and reinstall from the lockfile:

```bash
rm -rf node_modules
npm ci
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

Avoid deleting `package-lock.json` unless dependency regeneration is intentionally required.

---

### Environment variable issues

Verify:

* `.env.local` exists.
* Variable names match `.env.example`.
* Required values are configured.
* The development server was restarted after changing environment variables.

Next.js environment variables are loaded when the application starts, so changes may require restarting the development server.

---

### Build failure

Run:

```bash
npm ci
npm run build
```

Check the build output for:

* TypeScript errors
* Missing environment variables
* Invalid imports
* API configuration issues
* Dependency/version conflicts

---

## Security

Never commit secrets or credentials to the repository.

Sensitive values include:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SENDGRID_API_KEY
```

and any other private API credentials.

### Environment files

The following files should generally remain outside version control:

```text
.env
.env.local
.env.production
.env.*.local
```

The repository should contain:

```text
.env.example
```

with empty/example values only.

### Public environment variables

Any variable beginning with:

```text
NEXT_PUBLIC_
```

can be exposed to the browser.

Therefore, never store private credentials or secrets in `NEXT_PUBLIC_*` variables.

---

## Environment Variable Reference

The following variables are expected by the current application configuration:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_URL_PRODUCTS=
NEXT_PUBLIC_API_URL_CART=
NEXT_PUBLIC_API_URL_PAYMENT=
NEXT_PUBLIC_API_URL_AUERS=

NEXT_PUBLIC_API_URL_CMS=

NEXT_PUBLIC_API_URL_ORDER=
NEXT_PUBLIC_API_URL_HELPDESK=

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_GEOLOCATION_API_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_ENV_VARIABLE=

SENDGRID_API_KEY=
EMAIL_HOST_AUER=
EMAIL_HOST=
```

**Never add real credentials to this README.**

---

## Contributing

Before creating a pull request:

1. Pull the latest changes.
2. Install dependencies AUing the lockfile.
3. Run the application locally.
4. Test the affected functionality.
5. Run the production build.
6. Check for TypeScript/linting errors.
7. Verify that no secrets or environment files are included in the commit.
8. Keep the pull request focAUed on the intended change.

---

## License

This project is proprietary software belonging to ShopperBeats.

Unauthorized copying, distribution, modification, or commercial AUe is prohibited unless explicitly permitted by the project owner.

```
```
