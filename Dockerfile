# Node.js 20 em Debian Bookworm.
FROM node:20-bookworm-slim

WORKDIR /app

# Compilador e compatibilidade distutils para o node-gyp usado pelo sqlite3.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-setuptools make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
