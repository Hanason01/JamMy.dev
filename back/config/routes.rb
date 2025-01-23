Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth', controllers: {
    registrations: 'api/v1/auth/registrations',
    sessions: 'api/v1/auth/sessions',
    confirmations: 'api/v1/auth/confirmations'
  }
  namespace :api do
    namespace :v1 do
      resources :projects, only: %i[ index show create update destroy ] do
        resources :collaborations, only: %i[create]
        resources :collaboration_managements, only: %i[index]
        resource :collaboration_managements, only: %i[update]
      end
    end
  end
end
