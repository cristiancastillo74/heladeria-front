# Usa una versión de Node que soporte tu aplicación
FROM node:20.13.1

WORKDIR /app

# Copia los package.json primero para "cachar" las dependencias
COPY package*.json ./

RUN npm install

# Montamos el resto del código; esto permite que los cambios en el host se reflejen
COPY . .

# Exponemos el puerto de desarrollo de React (interno es 3000)
EXPOSE 3000

# Establece variable de entorno para que React use polling si hay problemas de watch
ENV CHOKIDAR_USEPOLLING=true

# Comando para correr React en modo desarrollo (hot reload)
CMD ["npm", "start"]
