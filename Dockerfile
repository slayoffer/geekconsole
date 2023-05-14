FROM node:18-alpine as BUILD
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.21.4-alpine
COPY --from=BUILD /app/build /usr/share/nginx/html
COPY --from=BUILD /app/public /usr/share/nginx/html
COPY .infra/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]