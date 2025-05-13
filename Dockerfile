FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the app (Vite uses .env automatically)
RUN npm run build

RUN npm install -g serve

# Serve on the port set in .env (VITE_PORT), default to 3000
ENV VITE_PORT=8080
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
