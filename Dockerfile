# Stage 1: Build stage
FROM node:23.7.0-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend to nginx html directory
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
