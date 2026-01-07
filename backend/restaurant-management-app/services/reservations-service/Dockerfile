FROM node:18-alpine

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copiază doar package.json și package-lock.json pentru instalare rapidă
COPY package*.json ./

# Copiază doar ce ai nevoie pentru build (libs și serviciul de restaurant)
COPY libs ./libs
COPY services/reservations-service ./services/reservations-service

# Instalează dependențele (la nivel de monorepo)
RUN npm install --legacy-peer-deps

# Setează workdir-ul specific serviciului
WORKDIR /usr/src/app/services/reservations-service

CMD ["npm", "run", "start:dev"]
