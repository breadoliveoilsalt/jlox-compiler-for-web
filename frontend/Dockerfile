# Frontend Dockerfile - Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

# Copy frontend source
COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/public ./public

# Install dependencies and build
# Support build-time environment variables (e.g., VITE_API_URL)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm ci
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (optional - for SPA routing)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

