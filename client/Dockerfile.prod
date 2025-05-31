# --------------------------------------
# 🔧 Build Stage (Vite frontend)
# --------------------------------------
FROM node:24-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# --------------------------------------
# 🚀 Production Stage (NGINX)
# --------------------------------------
FROM nginx:stable-alpine

# Copy built files from the build stage to the NGINX HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
