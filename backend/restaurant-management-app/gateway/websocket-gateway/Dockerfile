FROM node:18-alpine

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copiază doar package.json și package-lock.json pentru instalare rapidă
COPY package*.json ./

# Copiază doar ce ai nevoie pentru build (libs și gateway-ul websocket)
COPY libs ./libs
COPY gateway/websocket-gateway ./gateway/websocket-gateway

# Instalează dependențele (la nivel de monorepo)
RUN npm install --legacy-peer-deps

# Setează workdir-ul specific gateway-ului
WORKDIR /usr/src/app/gateway/websocket-gateway

CMD ["npm", "run", "start:dev"] 