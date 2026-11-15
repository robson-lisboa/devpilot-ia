# Imagem base oficial do Node.js 20 (compatível com @google/genai)
FROM node:20-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Instala ferramentas necessárias para compilar dependências nativas (sqlite3)
RUN apk add --no-cache python3 make g++

# Copia os arquivos de dependências
COPY package*.json ./

# Instala somente as dependências de produção
RUN npm install --omit=dev

# Copia todo o restante do código para o container
COPY . .

# Expõe a porta onde o servidor roda
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "index.js"]
