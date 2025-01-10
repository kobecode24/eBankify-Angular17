# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build -- --configuration=development

# Production stage
FROM nginx:alpine

# Remove default nginx user directive since we're running as non-root
RUN sed -i '/user  nginx;/d' /etc/nginx/nginx.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist/e-bankify-angular17/browser /usr/share/nginx/html

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx \
    /var/log/nginx \
    /var/run \
    /tmp/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    /var/log/nginx \
    /var/run \
    /tmp/nginx \
    /usr/share/nginx/html \
    /etc/nginx/conf.d \
    && chmod -R 755 /var/cache/nginx \
    /var/log/nginx \
    /var/run \
    /tmp/nginx \
    /usr/share/nginx/html

# Configure nginx
RUN echo "pid /tmp/nginx/nginx.pid;" > /etc/nginx/nginx.conf \
    && echo "events { worker_connections 1024; }" >> /etc/nginx/nginx.conf \
    && echo "http { include /etc/nginx/mime.types; include /etc/nginx/conf.d/*.conf; }" >> /etc/nginx/nginx.conf

USER nginx

CMD ["nginx", "-g", "daemon off;"]
