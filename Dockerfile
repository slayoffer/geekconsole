FROM node:18-alpine AS base
RUN npm i -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build
WORKDIR /app
COPY ./ .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm typecheck
RUN pnpm build
EXPOSE 3000
CMD ["npm", "run", "start"]

# RUN pnpm prune --prod
# FROM base AS deploy
# WORKDIR /app
# COPY --from=build /app/node_modules ./node_modules
