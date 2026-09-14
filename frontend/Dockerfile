FROM node:18-alpine

WORKDIR /app

# Salin package files terlebih dahulu (optimasi cache layer)
COPY package*.json ./

# Install dependencies dengan flag retry agar lebih stabil pada koneksi lambat
RUN npm install --legacy-peer-deps --prefer-offline || \
    npm install --legacy-peer-deps

# Salin seluruh source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
