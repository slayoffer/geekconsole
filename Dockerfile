FROM node:18-alpine as BUILD
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]