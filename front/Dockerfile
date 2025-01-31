FROM node:18.18.0
RUN apt-get update && apt-get install -y tzdata ca-certificates

# # タイムゾーンを指定
# ENV TZ=Asia/Tokyo
# # タイムゾーン設定を反映させる
# RUN dpkg-reconfigure -f noninteractive tzdata

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY ca.crt /usr/local/share/ca-certificates/ca.crt
RUN update-ca-certificates

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]