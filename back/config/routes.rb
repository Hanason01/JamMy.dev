Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth', controllers: {
    registrations: 'api/v1/auth/registrations'
  }
  namespace :api do
    namespace :v1 do
      resources :users, only: %i[create]
    end
  end
end
