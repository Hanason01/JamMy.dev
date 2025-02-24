require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.
  # Redis のキャッシュ設定
  config.cache_store = :redis_cache_store, { url: ENV['REDIS_URL'] }

  # SSLが必要な場合
  # config.cache_store = :redis_cache_store, {
  #   url: ENV['REDIS_URL'],
  #   ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
  # }


  # セッションストアも Redis に設定
  config.session_store :cache_store, key: "_jammy_session"
  # ActionCable の Redis 設定
  config.action_cable.url = ENV['REDIS_URL']
  config.action_cable.allowed_request_origins = ["https://jam-my.com"]

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = true

  # Ensures that a master key has been made available in either ENV["RAILS_MASTER_KEY"]
  # or in config/master.key. This key is used to decrypt credentials (and other encrypted files).
  config.require_master_key = true

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for Apache
  # config.action_dispatch.x_sendfile_header = "X-Accel-Redirect" # for NGINX

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :amazon

  # Mount Action Cable outside main process or domain.
  # config.action_cable.mount_path = nil
  # config.action_cable.url = "wss://example.com/cable"
  # config.action_cable.allowed_request_origins = [ "http://example.com", /http:\/\/example.*/ ]

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  # config.force_ssl = true

  # Include generic and useful information about system operation, but avoid logging too much
  # information to avoid inadvertent exposure of personally identifiable information (PII).
  config.log_level = :debug

  # Prepend all log lines with the following tags.
  config.log_tags = [ :request_id ]

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store

  # Use a real queuing backend for Active Job (and separate queues per environment).
  # config.active_job.queue_adapter     = :resque
  # config.active_job.queue_name_prefix = "app_production"

  config.action_mailer.perform_caching = false

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Use a different logger for distributed setups.
  # require "syslog/logger"
  # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new "app-name")

  if ENV["RAILS_LOG_TO_STDOUT"].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  config.force_ssl = true

  # ドメイン指定許可
  config.hosts << "jam-my.com"         # フロントエンドのドメイン
  config.hosts << "www.jam-my.com"     # フロントエンドのサブドメイン
  config.hosts << "api.jam-my.com"     # バックエンドのサブドメイン
  config.hosts << "jammy-dev.onrender.com"

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
  config.action_mailer.default_url_options = {
    host: 'api.jam-my.com', protocol: 'https'
  }
  # 認証メールテンプレート用パス
  config.x.confirmation_url = "https://www.jam-my.com/auth/confirmed"
  # パスワードリセットテンプレート用パス
  config.x.reset_password_url = "https://www.jam-my.com/auth/reset_password"
end
