# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production deps
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]
