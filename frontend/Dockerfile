#Docker Multistage
# First stage
# Use node 22.20 and the alpine 3.21 base image (Mini OS)
FROM node:22.20-alpine3.21 AS builder

# Create app directory and 
WORKDIR /app/

# Activate pnpm
RUN corepack enable 

# Copy package.json and package-lock.json files and install
COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Build the project
RUN pnpm run build



# Second stage
# * run is used on build time -> Create a new layer
# * CMD is used container ejecution time

FROM node:22.20-alpine3.21 AS runner
WORKDIR /app

RUN corepack enable

# COPIAR LO NECESARIO:
# 1. package.json (para saber qué scripts correr)
COPY --from=builder /app/package.json ./
# 2. node_modules (las librerías descargadas)
COPY --from=builder /app/node_modules ./node_modules
# 3. .next (tu aplicación compilada)
COPY --from=builder /app/.next ./.next
# 4. public (imágenes, favicons, etc.)
COPY --from=builder /app/public ./public

CMD [ "pnpm", "start" ]