class Devise::CustomMailer < Devise::Mailer
  include Devise::Mailers::Helpers

  # Devise の confirmation メール用に URL を渡すカスタマイズ
  # 継承元ソース「https://github.com/heartcombo/devise/blob/main/app/mailers/devise/mailer.rb」
  def confirmation_instructions(record, token, opts = {})
    opts[:confirmation_url] = Rails.configuration.x.confirmation_url
    super
  end
end
