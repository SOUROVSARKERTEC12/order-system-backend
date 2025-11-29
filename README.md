# Order System Backend

A robust, scalable, and production-ready backend for a real-time order management system. This project leverages modern technologies to provide secure authentication, real-time updates, payment processing, and AI-powered support.

## 🚀 Project Overview

The **Order System Backend** is designed to handle high-concurrency order processing with real-time feedback. It features a modular architecture separating concerns into services, controllers, and queues.

### Key Features
-   **Real-time Updates**: Instant order status updates using **Socket.io**.
-   **Secure Authentication**: Role-based access control (Admin/User) with **JWT** and **Bcrypt**.
-   **Payment Integration**: Seamless payments via **Stripe** and **PayPal**.
-   **AI Chatbot**: Integrated AI support using **OpenRouter (GPT-3.5 Turbo)**.
-   **Background Jobs**: Efficient email processing with **BullMQ** and **Redis**.
-   **Type Safety**: Full TypeScript support with **Zod** validation.

### Tech Stack
-   **Runtime**: Node.js v18+
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **Database**: PostgreSQL (via Prisma ORM)
-   **Caching & Queues**: Redis, BullMQ
-   **Real-time**: Socket.io
-   **Payments**: Stripe SDK, PayPal REST API

---

## 🛠 Setup & Installation

### Prerequisites
Ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Yarn](https://yarnpkg.com/) (v1.22+)
-   [PostgreSQL](https://www.postgresql.org/) (v14+)
-   [Redis](https://redis.io/) (v6+)

### Installation Steps

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd order-system-backend
    ```

2.  **Install dependencies**
    ```bash
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables)).

4.  **Database Setup**
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Run Database Migrations
    npx prisma migrate dev --name init
    ```

5.  **Start the Server**
    ```bash
    # Development mode (with hot reload)
    yarn dev

    # Production build & start
    yarn build
    yarn start
    ```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory. **Do not commit this file to version control.**

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mydb` |
| `REDIS_HOST` | Redis server host | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | `your_redis_password` |
| `REDIS_DB` | Redis database index | `0` |
| `JWT_SECRET` | Secret for signing JWTs | `super_secret_jwt_key` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_...` |
| `PAYPAL_CLIENT_ID` | PayPal Client ID | `AbC...` |
| `PAYPAL_CLIENT_SECRET` | PayPal Client Secret | `XyZ...` |
| `OPEN_ROUTER_KEY` | OpenRouter API Key | `sk-or-v1-...` |

---

## 📡 API Documentation

### Authentication

#### Register User
-   **Endpoint**: `POST /auth/register`
-   **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!",
      "role": "user" // or "admin"
    }
    ```
-   **Response (201)**:
    ```json
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    }
    ```

#### Login User
-   **Endpoint**: `POST /auth/login`
-   **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!"
    }
    ```
-   **Response (200)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": { ... }
    }
    ```

### Orders

#### Create Order
-   **Endpoint**: `POST /orders`
-   **Headers**: `Authorization: Bearer <token>`
-   **Body**:
    ```json
    {
      "items": [
        { "title": "Product A", "price": 100, "quantity": 1 }
      ],
      "paymentMethod": "STRIPE", // or "PAYPAL"
      "paymentFlow": "REGULAR"
    }
    ```
-   **Response (201)**:
    ```json
    {
      "status": "success",
      "data": {
        "order": { "id": "...", "status": "PENDING" },
        "paymentUrl": "..." // or clientSecret for Stripe
      }
    }
    ```

#### Get Orders
-   **Endpoint**: `GET /orders?page=1&limit=10`
-   **Headers**: `Authorization: Bearer <token>`
-   **Response (200)**:
    ```json
    {
      "status": "success",
      "data": [ ... ],
      "meta": { "total": 5, "page": 1, "limit": 10 }
    }
    ```

### Chatbot

#### Send Message
-   **Endpoint**: `POST /chatbot`
-   **Body**:
    ```json
    { "message": "Where is my order?" }
    ```
-   **Response (200)**:
    ```json
    { "reply": "Your order is currently processing..." }
    ```

---

## 🎣 Webhook Integration Guide

Webhooks are used to receive real-time payment updates from Stripe and PayPal.

### How it Works
1.  User initiates payment on frontend.
2.  Payment provider processes transaction.
3.  Provider sends a `POST` request to your backend webhook URL.
4.  Backend verifies signature, updates order status, and notifies user via Socket.io.

### Stripe Webhook
-   **URL**: `POST /payments/webhook/stripe`
-   **Headers**: `Stripe-Signature`
-   **Payload Verification**: Uses `STRIPE_WEBHOOK_SECRET` to verify authenticity.

#### Testing with Stripe CLI
1.  **Login**: `stripe login`
2.  **Listen**: `stripe listen --forward-to localhost:3000/payments/webhook/stripe`
3.  **Trigger**: `stripe trigger payment_intent.succeeded`
4.  **Copy Secret**: The CLI will show a secret (e.g., `whsec_...`). Add this to your `.env`.

### PayPal Webhook
-   **URL**: `POST /payments/webhook/paypal`
-   **Event Types**: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

#### Testing with PayPal Simulator
1.  Go to [PayPal Developer Dashboard](https://developer.paypal.com/).
2.  Navigate to **Testing Tools > Webhooks Simulator**.
3.  Enter your **ngrok** URL: `https://<your-ngrok-id>.ngrok.io/payments/webhook/paypal`.
4.  Select Event: `PAYMENT.CAPTURE.COMPLETED`.
5.  Click **Send Test**.

---

## 📂 Folder Structure

```
src/
├── config/           # Configuration (DB, Redis)
├── enums/            # TypeScript Enums (Roles, Status)
├── interfaces/       # TypeScript Interfaces
├── middlewares/      # Express Middlewares (Auth, RateLimit)
├── modules/
│   ├── controllers/  # Request Handlers
│   └── services/     # Business Logic
├── queues/           # BullMQ Workers (Email)
├── routes/           # API Route Definitions
├── schemas/          # Zod Validation Schemas
├── socket/           # Socket.io Service
├── utils/            # Shared Utilities (Error handling, Logger)
└── app.ts            # App Entry Point
```

---

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `yarn dev` | Run server in development mode with nodemon |
| `yarn build` | Compile TypeScript to JavaScript |
| `yarn start` | Run the compiled production server |
| `yarn test` | Run tests |
| `yarn clean` | Remove `dist` folder |
| `yarn migration:generate` | Generate migration files |

---

## 📝 Additional Notes

-   **Rate Limiting**: Global rate limiting is enabled (100 requests per 15 mins) to prevent abuse.
-   **Error Handling**: Centralized error handling middleware ensures consistent JSON error responses.
-   **Socket.io**: Ensure your frontend client connects to the same port as the backend for real-time events.
