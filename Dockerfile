# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
COPY package*.json ./
RUN npm i --production

EXPOSE 3000
CMD ["node", "dist/server/server.js"]