# base node image
FROM node:18-bookworm-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y fuse3 openssl sqlite3 ca-certificates

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /app

# ADD package.json package-lock.json .npmrc ./
ADD package.json .npmrc ./
# RUN npm cache clean --force
RUN npm install --include=dev

# Build the app
FROM base as build

ENV FLY="false"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_URL="file:./data.db"
ENV DATABASE_PATH="./prisma/data.db"
ENV CACHE_DATABASE_PATH="./other/cache.db"

ENV RESEND_API_KEY="re_hDfLT37G_DCQbEPTBGkt2EjqpjttSjrq8"
ENV GITHUB_CLIENT_ID="MOCK_f37538bf1b0a19307535"
ENV GITHUB_CLIENT_SECRET="MOCK_2d4d061206723738725365cd0da9bf0c83be29bb"
ENV SENTRY_DSN="https://6ab11c7d99cf03be36fa87b30e251670@o4506263262724096.ingest.sentry.io/4506263264821248"

ENV HONEYPOT_SECRET=superSecret
ENV SESSION_SECRET=verySecret
ENV INTERNAL_COMMAND_TOKEN="some-made-up-token"

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build && \
    npx prisma migrate deploy && \
    npx prisma db seed

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli
# RUN database-cli

EXPOSE 3000
# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "start"]