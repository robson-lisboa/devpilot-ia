# Imagem base oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia todo o restante do código para o container
COPY . .

# Expõe a porta onde o servidor roda
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "index.js"]