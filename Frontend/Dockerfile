# -------- 1) Build del frontend --------
FROM node:21 AS build

WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias (mejor cacheo)
COPY ./TiendaClick/package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY ./TiendaClick .

# Ejecutar el build de vite (correcto)
RUN npm run build

#test COMMENT

# -------- 2) Imagen final con Nginx --------
FROM nginx:alpine

# Copiar el build a nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Sobrescribir la config por defecto
COPY default.conf /etc/nginx/conf.d/default.conf

# Nginx usa 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

