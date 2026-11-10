# ---- Etapa 1: compilar con Vite ----
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# Cypress es solo para pruebas e2e: no descargamos su binario en la imagen
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci

COPY . .
# Las variables VITE_* se fijan al compilar. Es la URL de la API vista desde el NAVEGADOR
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Etapa 2: servir los archivos estaticos con Nginx ----
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
