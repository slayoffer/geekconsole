# This file is moved to the root directory before building the image

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

# Setup production node_modules
FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
# ADD package.json package-lock.json .npmrc ./
ADD package.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV CACHE_DATABASE_FILENAME="cache.db"
ENV CACHE_DATABASE_PATH="/$LITEFS_DIR/$CACHE_DATABASE_FILENAME"
ENV INTERNAL_PORT="8080"
ENV PORT="8081"
# ENV NODE_ENV="production"
# ENV LITEFS_DIR="/litefs/data"
# ENV DATABASE_URL="file:./data.db"
# ENV DATABASE_PATH="./prisma/data.db"
# ENV CACHE_DATABASE_PATH="./other/cache.db"

ENV RESEND_API_KEY="re_hDfLT37G_DCQbEPTBGkt2EjqpjttSjrq8"
ENV GITHUB_CLIENT_ID="f37538bf1b0a19307535"
ENV GITHUB_CLIENT_SECRET="2d4d061206723738725365cd0da9bf0c83be29bb"
ENV SENTRY_DSN=""

# ENV HONEYPOT_SECRET=superSecret
# ENV SESSION_SECRET=verySecret
# ENV INTERNAL_COMMAND_TOKEN="some-made-up-token"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/server-build /app/server-build
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/prisma /app/prisma
# COPY --from=build /app/app/components/ui/icons /app/app/components/ui/icons

# prepare for litefs
COPY --from=flyio/litefs:0.5.8 /usr/local/bin/litefs /usr/local/bin/litefs
ADD other/litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

ADD . .

CMD ["litefs", "mount"]