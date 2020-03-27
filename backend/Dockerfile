FROM node:10-alpine
WORKDIR /backend
COPY package* ./
RUN apk add --no-cache git
RUN npm install
COPY . .
ENV elasticsearch_host db:9200
CMD npm start
EXPOSE 3000