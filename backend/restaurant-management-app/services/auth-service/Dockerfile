# # Dockerfile (ex: pentru auth-service)

# FROM node:18-alpine

# WORKDIR /usr/src/app

# # Copiază tot monorepo-ul (inclusiv libs)
# COPY . .

# # Instalează din directorul de bază
# RUN npm install --legacy-peer-deps

# # Setează workdir-ul specific
# WORKDIR /usr/src/app/services/auth-service

# CMD ["npm", "run", "start:dev"]

FROM node:18-alpine

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copiază doar package.json și package-lock.json pentru instalare rapidă
COPY package*.json ./

# Copiază doar ce ai nevoie pentru build (libs și serviciul de auth)
COPY libs ./libs
COPY services/auth-service ./services/auth-service

# Instalează dependențele (la nivel de monorepo)
RUN npm install --legacy-peer-deps

# Setează workdir-ul specific serviciului
WORKDIR /usr/src/app/services/auth-service

CMD ["npm", "run", "start:dev"]
