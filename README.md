# Real-Time Order Management System

A robust backend system for order management with real-time updates, payment integration (Stripe/PayPal), and an AI chatbot.

## Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-Time**: Socket.io
- **Payments**: Stripe, PayPal
- **AI**: HuggingFace Inference API
- **Validation**: Zod
- **Auth**: JWT, Bcrypt

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    yarn install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory with the following content:
    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/order_db?schema=public"
    JWT_SECRET="your_jwt_secret"
    STRIPE_SECRET_KEY="your_stripe_secret_key"
    STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
    PAYPAL_CLIENT_ID="your_paypal_client_id"
    PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
    HUGGINGFACE_API_KEY="your_huggingface_api_key"
    ```
4.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Run the server**:
    ```bash
    yarn start
    # OR for development
    yarn dev
    ```

## API Endpoints

### Auth
- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Login and get JWT.

### Orders
- `POST /orders`: Create a new order.
- `GET /orders`: Get all orders for the logged-in user.
- `PATCH /orders/:id/status`: Update order status (Admin only).

### Payments
- `POST /payments/webhook/stripe`: Stripe webhook handler.
- `POST /payments/webhook/paypal`: PayPal webhook handler.

### Chatbot
- `POST /chatbot`: Chat with the AI assistant.

## Real-Time Updates
Connect to the Socket.io server with the JWT token in the `auth` object or query param `token`.
Events:
- `orderUpdate`: Received when an order status changes.

## Webhook Testing
- **Stripe**: Use Stripe CLI to forward events to `localhost:3000/payments/webhook/stripe`.
- **PayPal**: Use PayPal Sandbox Webhooks simulator.
