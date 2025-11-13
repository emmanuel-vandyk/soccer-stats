FROM oven/bun:latest

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies with specific platform
RUN bun install --frozen-lockfile

# Bundle app source
COPY . .

# Build TypeScript
RUN bun build ./src/index.ts --outdir ./dist --target node

EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["bun", "run", "start"]