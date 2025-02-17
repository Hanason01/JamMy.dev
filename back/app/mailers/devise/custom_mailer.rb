class Devise::CustomMailer < Devise::Mailer
  include Devise::Mailers::Helpers

  # Devise の confirmation メール用に URL を渡すカスタマイズ
  # 継承元ソース「https://github.com/heartcombo/devise/blob/main/app/mailers/devise/mailer.rb」
  def confirmation_instructions(record, token, opts = {})
    opts[:confirmation_url] = Rails.configuration.x.confirmation_url
    opts[:subject] ="メールアドレス認証"
    super
  end


  def reset_password_instructions(record, token, opts = {})
    opts[:subject] ="パスワード再設定のご案内"
    super
  end
end
