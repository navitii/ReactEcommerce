# Restaurant Ordering System with Audit Timeline

A full-stack restaurant ordering application built with Next.js 15, TypeScript, and Tailwind CSS. Features a robust, immutable event timeline (audit trail) for every action in the order lifecycle.

## Features

- **Menu Browsing**: Dynamic product list with complex modifier groups (Protein, Toppings, Sauces).
- **Cart Management**: Server-side pricing calculation, add/remove items.
- **Checkout**: Async order creation with Idempotency support.
- **Order Timeline**: Visual audit trail of all events (Cart Added, Pricing Calculated, Order Placed, Status Changed).
- **Tech Stack**: Next.js 15 (App Router), Tailwind CSS v4, In-Memory DB (Simulated).

## Prerequisites

- Node.js v18+ 
- npm or pnpm

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: For this preview version, no external API keys are strictly required as the DB is in-memory)*

## How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the App**:
   Visit [http://localhost:3000](http://localhost:3000)

## Architecture Notes

### Backend / API
- **Framework**: Next.js API Routes (`app/api/*`) are used to simulate a serverless backend.
- **Database**: An in-memory singleton (`lib/repository.ts`) is used for this demo to ensure zero-setup runnability. In a production environment, this would be replaced with MongoDB or DynamoDB.
- **Event Sourcing**: All critical actions generate `TimelineEvent` records. These are append-only and serve as the source of truth for the audit trail.

### Serverless
A `serverless.yml` is included in the root to demonstrate how this architecture would be deployed to AWS Lambda. However, for the local dev experience in this specific container environment, we use `npm run dev` (Next.js).

## Testing

To run the linting check:
```bash
npm run lint
```

## API Endpoints

- `GET /api/menu` - Fetch products
- `GET /api/cart` - Fetch current user cart
- `POST /api/cart` - Add item to cart
- `POST /api/orders` - Place order (Idempotent)
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/timeline` - Get audit trail
