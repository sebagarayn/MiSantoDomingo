FROM node:24-bookworm-slim

WORKDIR /app

# Primero las dependencias: si solo cambia el codigo, Docker reutiliza esta capa
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .

# Carpeta de fotos de reclamos (compose la monta como volumen)
RUN mkdir -p /app/uploads && chown node:node /app/uploads

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]
