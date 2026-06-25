FROM node:20-alpine

WORKDIR /app

COPY server/package*.json server/
RUN npm install --prefix server --omit=dev

COPY server/ server/

EXPOSE 5002

CMD ["node", "server/index.js"]
