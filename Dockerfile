FROM node AS build
WORKDIR /frontend
COPY frontend/package* ./
RUN npm install
COPY frontend .
ARG AERGO_NODE
ENV AERGO_NODE ${AERGO_NODE}
RUN npm run build



FROM nginx:stable-alpine
COPY --from=build /frontend/build/ /var/www/
ADD nginx/localhost.conf /etc/nginx/conf.d/localhost.conf