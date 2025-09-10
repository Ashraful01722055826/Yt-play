# Multi-stage build: build Vite app then serve with nginx
FROM node:18-alpine AS build
WORKDIR /app
# copy package files and install
COPY frontend/package*.json ./
RUN npm ci
# copy source and build
COPY frontend/ ./
RUN npm run build

# Serve with nginx
FROM nginx:stable-alpine
# Custom nginx config will handle SPA fallback and proxy /api to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]