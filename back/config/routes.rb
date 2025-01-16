Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth', controllers: {
    registrations: 'api/v1/auth/registrations',
    sessions: 'api/v1/auth/sessions'
  }
  namespace :api do
    namespace :v1 do
      get 'collaborations/show'
      resources :projects, only: %i[ index create edit update destroy ] do
        resources :collaborations, only: %i[create]
        resources :collaboration_managements, only: %i[index]
      end
    end
  end
end
