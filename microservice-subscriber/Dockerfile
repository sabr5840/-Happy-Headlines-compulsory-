# microservice-subscriber/Dockerfile

FROM node:20

# arbejdsmappe inde i containeren
WORKDIR /app

# kopier package.json + lockfile først (for bedre cache)
COPY package*.json ./

# installer dependencies
RUN npm install

# kopier resten af koden
COPY . .

# service lytter på port 3003
EXPOSE 3003

# start kommando
CMD ["npm", "start"]
