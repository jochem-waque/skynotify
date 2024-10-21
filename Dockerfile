# Set-up build image
FROM node:22-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app

# Copy package.json, lockfile and .npmrc
COPY ["pnpm-lock.yaml", "package.json", "./"]

# Install build tools
RUN apk add --no-cache alpine-sdk python3 && \
    npm install -g pnpm && \
    NODE_ENV=development pnpm install

# Copy all files to working directory
COPY . .

# Compile and remove dev packages
RUN pnpm build --experimental-build-mode compile && \
    pnpm prune --prod

# Set-up running image
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all files
COPY --from=builder /app .

# Generate and run
CMD pnpm build ; pnpm start