Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth', controllers: {
    registrations: 'api/v1/auth/registrations',
    sessions: 'api/v1/auth/sessions'
  }
  namespace :api do
    namespace :v1 do
      get 'collaborations/show'
      resources :projects, only: %i[ index create ] do
        resources :collaborations, only: %i[ new create]
      end
    end
  end
end
