FROM node:16-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./
RUN npm install
COPY ./src ./src

FROM node:16-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./
RUN npm install
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 4001
CMD ["npm", "run", "start"]
