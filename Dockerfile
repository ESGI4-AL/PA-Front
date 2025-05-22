FROM node:18-alpine AS builder

# Permet de passer la variable d’environnement au moment du build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY . .

RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]