FROM node AS build
WORKDIR /frontend
COPY frontend/package* ./
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN ${GITHUB_TOKEN}
RUN git config --global url."https://${GITHUB_TOKEN}:@github.com/".insteadOf "https://github.com/"
RUN npm install
COPY frontend .
ARG AERGO_NODE
ENV AERGO_NODE ${AERGO_NODE}
ARG AERGO_URL
ENV AERGO_URL ${AERGO_URL}
ARG API_URL
ENV API_URL ${API_URL}
ARG BACKEND_URL
ENV BACKEND_URL ${BACKEND_URL}
ARG CONFIG_NAME
ENV CONFIG_NAME ${CONFIG_NAME}
RUN npm run build


FROM nginx:stable-alpine
COPY --from=build /frontend/build/ /var/www/
ADD nginx/localhost.conf /etc/nginx/conf.d/localhost.conf
ARG AERGO_NODE
ENV AERGO_NODE ${AERGO_NODE}
RUN echo AERGO_NODE=${AERGO_NODE}
RUN sed -i "s/AERGO_NODE/${AERGO_NODE}/" /etc/nginx/conf.d/localhost.conf
