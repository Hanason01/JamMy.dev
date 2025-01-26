OmniAuth.config.allowed_request_methods = [:get,:post]
OmniAuth.config.silence_get_warning = true
OmniAuth.config.full_host = lambda do |env|
  if Rails.env.production?
    "https://api.jam-my.com"
  else
    "https://localhost:3000"
  end
end
