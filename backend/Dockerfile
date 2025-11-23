FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Install all dependencies including devDependencies for build
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
