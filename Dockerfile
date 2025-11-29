# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Copy built assets + node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json yarn.lock ./

EXPOSE 3000

# Only start the app
CMD ["node", "dist/index.js"]