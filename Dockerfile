# Multi-stage Dockerfile for Tripoli Business Center Training & Certificates Management System

# Stage 1: Build Phase
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies required for compile/bundle)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build both the client-side bundle and browser-ready assets, 
# and compile the typescript backend to dist/server.cjs
RUN npm run build

# Stage 2: Production Execution Phase
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install ONLY production dependencies to keep the container lightweight
RUN npm ci --only=production

# Copy compiled folders from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db_store.json ./db_store.json

# Expose server listener port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start container through the standard start script defined in package.json
CMD ["npm", "start"]
