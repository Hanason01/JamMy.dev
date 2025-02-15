require "active_support/core_ext/integer/time"


Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.
  config.after_initialize do
    Bullet.enable = true
    Bullet.alert = true
    Bullet.bullet_logger = true
    Bullet.console = true
    Bullet.rails_logger = true
  end
  # In the development environment your application's code is reloaded any time
  # it changes. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = true

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable server timing
  config.server_timing = true

  # Redisのキャッシュ設定
  config.cache_store = :redis_cache_store, { url: ENV['REDIS_URL'] || 'redis://localhost:6379/1' }
  config.public_file_server.headers = {
  "Cache-Control" => "public, max-age=#{2.days.to_i}"
}
  config.session_store :cache_store, key: "_jammy_session"

  # ActionController::Live を使用するための設定
  config.allow_concurrency = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  # if Rails.root.join("tmp/caching-dev.txt").exist?
  #   config.cache_store = :memory_store
  #   config.public_file_server.headers = {
  #     "Cache-Control" => "public, max-age=#{2.days.to_i}"
  #   }
  # else
  #   config.action_controller.perform_caching = false

  #   config.cache_store = :null_store
  # end

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :amazon

  # Resid関係設定
  config.action_cable.url = "redis://localhost:6379/1"
  config.action_cable.allowed_request_origins = ["https://localhost:8000", "http://localhost:8000"]

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true


  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Uncomment if you wish to allow Action Cable access from any origin.
  # config.action_cable.disable_request_forgery_protection = true
  config.hosts << "api"
  config.hosts << "localhost"
  config.hosts << "127.0.0.1"
  config.hosts << "back"
  config.ssl_options = {
  hsts: false # Strict-Transport-Security ヘッダーを無効化
}

  config.force_ssl = true
  config.logger = ActiveSupport::Logger.new(STDOUT)
  config.log_level = :debug

  # メール
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: 'smtp-relay.brevo.com',
    port: 587,
    user_name: Rails.application.credentials.dig(:brevo, :smtp_login),
    password: Rails.application.credentials.dig(:brevo, :smtp_password),
    authentication: 'login',
    enable_starttls_auto: true
  }

  config.action_mailer.default_options = {
    from: 'no-reply@jam-my.com'
  }

  # エラーをログに出力
  config.action_mailer.raise_delivery_errors = true
  # 実際にメールを送信
  config.action_mailer.perform_deliveries = true
  # メールのURL設定（Devise用）
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000, protocol: 'https' }
  # 認証メールテンプレート用パス
  config.x.confirmation_url = "https://localhost:8000/auth/confirmed"
  # パスワードリセットテンプレート用パス
  config.x.reset_password_url = "https://localhost:8000/auth/reset_password"
end
