FROM node:20-alpine
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar código necesario
COPY public ./public
COPY server.js ./server.js
COPY db.json ./db.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
