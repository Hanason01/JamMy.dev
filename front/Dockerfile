FROM node:18.18.0
RUN apt-get update && apt-get install -y tzdata

# # タイムゾーンを指定
# ENV TZ=Asia/Tokyo
# # タイムゾーン設定を反映させる
# RUN dpkg-reconfigure -f noninteractive tzdata

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]