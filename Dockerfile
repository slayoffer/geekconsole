FROM node:18-alpine as BUILD
WORKDIR /app
COPY package*.json ./
RUN pnpm ci
COPY ./ .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "start"]