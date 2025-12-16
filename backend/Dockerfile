# Backend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Copy TypeScript config
COPY tsconfig.json ./
COPY backend/tsconfig.json ./backend/

# Copy source code
COPY compiler ./compiler
COPY parser ./parser
COPY scanner ./scanner
COPY errors ./errors
COPY systemPrint ./systemPrint
COPY backend/index.ts ./backend/
COPY backend/utils ./backend/utils

# Install dependencies
WORKDIR /app/backend
RUN npm ci

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
