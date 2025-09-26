# Brug Node.js som base
FROM node:20

# Sæt working directory
WORKDIR /app

# Kopiér package.json og installer dependencies
COPY package*.json ./
RUN npm install

# Kopiér resten af koden ind i containeren
COPY . .

# Expose porten som ArticleService bruger
EXPOSE 3000

# Start serveren
CMD ["npm", "start"]
