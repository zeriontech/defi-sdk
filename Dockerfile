FROM alpine:latest

RUN apk add --no-cache curl python3 python2 cmake make g++ gcc nodejs npm git bash

ENV NPM_CONFIG_LOGLEVEL warn
RUN mkdir /home/root
RUN mkdir /home/root/truffle
WORKDIR /home/root/truffle
COPY ./contracts ./contracts
COPY ./migrations ./migrations
COPY ./scripts ./scripts
COPY ./test ./test
COPY ./.solcover.js .
COPY ./.babelrc .
COPY ./truffle.js .
COPY ./package.json .

RUN npm install

ENTRYPOINT ["/home/root/truffle/scripts/coverage.sh"]
