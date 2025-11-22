FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN NPM_CONFIG_PRODUCTION=false npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
