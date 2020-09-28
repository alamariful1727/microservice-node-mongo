FROM node:latest

RUN mkdir -p /app/src

WORKDIR /app/src

COPY . .

RUN yarn

RUN yarn build

EXPOSE 4040

CMD yarn start
# CMD yarn dev