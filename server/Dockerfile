FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || npm install
COPY . .
RUN npm run build
ENV PORT=2567
EXPOSE 2567
CMD ["node", "dist/index.js"]
