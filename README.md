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

## � API Documentation with Swagger

### Overview
This project uses **Swagger (OpenAPI 3.0)** to provide interactive API documentation. Swagger UI allows you to explore, test, and understand all available API endpoints without writing any code.

### Accessing Swagger UI
Once the server is running, navigate to:
```
http://localhost:3000/api-docs
```

Or in production:
```
https://your-domain.com/api-docs
```

### Features
- **Interactive API Testing**: Test endpoints directly from your browser
- **JWT Authentication**: Click "Authorize" button and enter your bearer token
- **Request/Response Examples**: See sample payloads and responses for each endpoint
- **Auto-generated Documentation**: Automatically updated based on route annotations

### Using Swagger UI

#### 1. Authentication Flow
1. Navigate to `/api-docs`
2. Find the **POST /auth/login** endpoint
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "email": "user@example.com",
     "password": "Password123!"
   }
   ```
5. Click "Execute"
6. Copy the `token` from the response
7. Click the **Authorize** button at the top
8. Enter: `Bearer <your-token>`
9. Click "Authorize" - now you can access protected endpoints

#### 2. Testing Protected Endpoints
After authentication:
- All requests will automatically include your JWT token
- Green lock icons indicate authenticated endpoints
- Test order creation, retrieval, and updates

### Configuration
Swagger is configured in [`swagger.config.ts`](file:///h:/order-system-backend/src/config/swagger.config.ts):
- **OpenAPI Version**: 3.0.0
- **Security Schemes**: Bearer JWT Authentication
- **Request/Response Schemas**: Fully typed with validation rules

### Customization
To add documentation for new endpoints, use JSDoc comments in your route files:
```typescript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     summary: Your endpoint description
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: Success
 */
```

---

## 📡 API Endpoints Reference

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

## � Real-time Communication with Socket.io

### Overview
**Socket.io** is integrated to provide real-time, bidirectional communication between the server and connected clients. This enables instant order status updates, notifications, and live data synchronization without polling.

### Connection Setup

#### Server Configuration
The Socket.io server is initialized in [`app.ts`](file:///h:/order-system-backend/src/app.ts#L30) and managed by the `SocketService` singleton located in [`socket.service.ts`](file:///h:/order-system-backend/src/socket/socket.service.ts).

```typescript
import { SocketService } from './socket/socket.service';

// Initialize Socket.io with the HTTP server
SocketService.getInstance().init(server);
```

#### Client Connection
Connect from your frontend application:

```javascript
import { io } from 'socket.io-client';

// Development
const socket = io('http://localhost:3000');

// Production
const socket = io('https://order-system-backend-nqi8.onrender.com');

// With authentication (recommended)
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Real-time Events

#### 1. Order Status Updates
When an order status changes (via admin action or payment webhook), all connected clients receive updates:

**Server Emission** (from backend):
```typescript
SocketService.getInstance().emitOrderUpdate(orderId, {
  orderId: 'uuid',
  status: 'processing',
  updatedAt: new Date().toISOString()
});
```

**Client Listener** (in frontend):
```javascript
socket.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
  // Update UI with new status
  updateOrderUI(data.orderId, data.status);
});
```

#### 2. Payment Confirmations
Real-time payment success/failure notifications:

**Client Listener**:
```javascript
socket.on('paymentSuccess', (data) => {
  console.log('Payment confirmed:', data);
  showSuccessNotification(data.orderId, data.amount);
});

socket.on('paymentFailed', (data) => {
  console.log('Payment failed:', data);
  showErrorNotification(data.message);
});
```

#### 3. Custom Events
**Emitting from Client**:
```javascript
// Join a specific order room
socket.emit('joinOrder', { orderId: 'abc-123' });

// Leave an order room
socket.emit('leaveOrder', { orderId: 'abc-123' });
```

**Server-side Room Management**:
```typescript
socket.on('joinOrder', ({ orderId }) => {
  socket.join(`order:${orderId}`);
});

// Emit to specific room
io.to(`order:${orderId}`).emit('orderUpdate', data);
```

### Testing Socket.io Connections

#### Method 1: Browser Console
1. Open your frontend application
2. Open browser DevTools (F12)
3. Go to Console tab
4. Test connection:
   ```javascript
   const socket = io('http://localhost:3000');
   socket.on('connect', () => console.log('Connected'));
   socket.on('orderUpdate', (data) => console.log(data));
   ```

#### Method 2: Postman (WebSocket Support)
1. Open Postman
2. Create a new **WebSocket Request**
3. Enter URL: `ws://localhost:3000`
4. Click "Connect"
5. Listen for events or send custom events

#### Method 3: Socket.io Client Test Tool
```bash
npm install -g socket.io-client-test
socket-test http://localhost:3000
```

### Use Cases

| Use Case | Event Name | Description |
| :--- | :--- | :--- |
| Order placed | `orderCreated` | Notify admins of new orders |
| Status change | `orderUpdate` | Real-time status updates to users |
| Payment success | `paymentSuccess` | Instant payment confirmation |
| Payment failure | `paymentFailed` | Alert user of payment issues |
| Admin broadcast | `announcement` | Send messages to all connected users |

### Security Considerations

1. **Authentication**: Implement token-based authentication for Socket.io connections
   ```typescript
   io.use((socket, next) => {
     const token = socket.handshake.auth.token;
     if (isValidToken(token)) {
       next();
     } else {
       next(new Error('Authentication error'));
     }
   });
   ```

2. **Rate Limiting**: Prevent socket spam with rate limits
3. **Room Isolation**: Users should only join rooms for their own orders
4. **CORS Configuration**: Properly configure allowed origins

### Deployment Notes

- **Sticky Sessions**: Enable sticky sessions when deploying with multiple instances
- **Redis Adapter**: For horizontal scaling, use the Redis adapter:
  ```typescript
  import { createAdapter } from '@socket.io/redis-adapter';
  io.adapter(createAdapter(redisClient, redisClient.duplicate()));
  ```
- **Health Checks**: Render and other platforms support Socket.io natively with WebSocket support

### Troubleshooting

**Connection Issues**:
- Verify CORS settings allow your frontend origin
- Check firewall rules allow WebSocket connections (port 3000)
- Ensure no reverse proxy is blocking WebSocket upgrades

**Events Not Received**:
- Confirm client is listening to correct event names (case-sensitive)
- Check server logs to verify events are being emitted
- Verify user is in the correct room (if using rooms)

---

## �📂 Folder Structure

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

## ☁️ Deployment

### Render Deployment (Recommended for Socket.io)

Live link : https://order-system-backend-nqi8.onrender.com/

[Render](https://render.com/) is a unified cloud to build and run all your apps and websites. It supports Node.js and Docker, making it ideal for this application.

1.  **Create a Render Account**
    -   Sign up at [render.com](https://render.com/).

2.  **Create a New Web Service**
    -   Click **New +** and select **Web Service**.
    -   Connect your GitHub/GitLab repository.

3.  **Configure the Service**
    -   **Name**: `order-system-backend`
    -   **Region**: Select a region close to your users.
    -   **Branch**: `main` (or your default branch).
    -   **Runtime**: `Docker` (recommended, as a `Dockerfile` is provided) OR `Node`.
        -   *If using Node Runtime*:
            -   **Build Command**: `yarn install && yarn build`
            -   **Start Command**: `yarn start`
        -   *If using Docker Runtime*:
            -   Render will automatically detect the `Dockerfile` and build the image.

4.  **Environment Variables**
    -   Go to the **Environment** tab.
    -   Add all variables from your `.env` file (e.g., `DATABASE_URL`, `REDIS_HOST`, `STRIPE_SECRET_KEY`, etc.).
    -   **Note**: For Redis, you can create a managed Redis instance on Render and use the internal connection URL.

5.  **Deploy**
    -   Click **Create Web Service**. Render will start the build and deployment process.

---

## 📝 Additional Notes

-   **Rate Limiting**: Global rate limiting is enabled (100 requests per 15 mins) to prevent abuse.
-   **Error Handling**: Centralized error handling middleware ensures consistent JSON error responses.
-   **Socket.io**: For detailed real-time features and event handling, see [Real-time Communication with Socket.io](#-real-time-communication-with-socketio).
-   **API Documentation**: Interactive Swagger UI is available at `/api-docs` for testing and exploring all endpoints.
