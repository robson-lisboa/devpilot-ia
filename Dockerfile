# Imagem Node.js 20 baseada em Debian Bullseye.
# A base Debian usa Python 3.9, que mantém distutils para o node-gyp 8 do sqlite3.
FROM node:20-bullseye-slim

WORKDIR /app

# Ferramentas necessárias para compilar a dependência nativa sqlite3.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-distutils make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
