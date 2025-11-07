# Stage 1: Build the Angular application
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Angular configuration files
COPY angular.json tsconfig*.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application for production
RUN bun run build -- --configuration=production

# Stage 2: Serve with Bun
FROM oven/bun:1-alpine

WORKDIR /app

# Copy the built application
COPY --from=builder /app/dist/frontend/browser ./public

# Copy server file
COPY server.js ./

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000 || exit 1

# Start the server
CMD ["bun", "run", "server.js"]
