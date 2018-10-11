FROM node AS build
WORKDIR /frontend
COPY frontend/package* ./
RUN npm install
COPY frontend .
RUN npm run build



FROM nginx:stable-alpine
COPY --from=build /frontend/build/ /var/www/
ADD nginx/localhost.conf /etc/nginx/conf.d/localhost.conf
ADD nginx/aergoscan.conf /etc/nginx/conf.d/aergoscan.conf
ADD nginx/origin.pem /etc/nginx/origin.pem
ADD nginx/origin.key /etc/nginx/origin.key