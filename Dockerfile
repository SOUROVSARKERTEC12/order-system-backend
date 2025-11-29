# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]
