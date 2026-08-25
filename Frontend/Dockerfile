FROM node:20-alpine

WORKDIR /app

COPY TiendaClick/package*.json ./
RUN npm install

COPY TiendaClick/ .

EXPOSE 5173

CMD ["npm", "run", "dev"]
