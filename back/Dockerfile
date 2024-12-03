FROM ruby:3.3.5
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client openssl

ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock

RUN gem install bundler
RUN bundle install

COPY . /app

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
