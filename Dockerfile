FROM node AS build
WORKDIR /frontend
COPY frontend/package* ./
RUN npm install
COPY frontend .
RUN npm run build



FROM nginx:stable-alpine
COPY --from=build /frontend/build/ /var/www/
ADD nginx/aergoscan.conf /etc/nginx/conf.d/aergoscan.conf
