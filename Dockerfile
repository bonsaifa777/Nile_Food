FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install

COPY server/ ./server/
COPY shared/ ./shared/

EXPOSE 5001

CMD ["node", "server/index.js"]
