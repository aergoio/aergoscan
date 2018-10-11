FROM node
WORKDIR /backend
COPY package* ./
RUN npm install
COPY . .
ENV elasticsearch_host db:9200
CMD npm start
