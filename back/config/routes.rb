Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth', controllers: {
    registrations: 'api/v1/auth/registrations',
    sessions: 'api/v1/auth/sessions',
    confirmations: 'api/v1/auth/confirmations',
    passwords: 'api/v1/auth/passwords',
    omniauth_callbacks: 'api/v1/auth/omniauth_callbacks',
    token_validations: 'api/v1/auth/token_validations'
  }


  namespace :api do
    namespace :v1 do
      resources :projects, only: %i[ index show create update destroy ] do
        resources :collaborations, only: %i[create]
        resources :collaboration_managements, only: %i[index]
        resource :collaboration_managements, only: %i[update]
        resources :likes, only: %i[create destroy], module: :projects
        resources :bookmarks, only: %i[create destroy], module: :projects
        resources :comments, only: %i[index], module: :projects
      end
      resources :comments, only: %i[create destroy]
      namespace :users do
        resource :me, only: [] do
          get "my_projects", to: "projects#index"
        end
        resource :profile, only: %i[show update]
        resources :user_profiles, only: %i[show]
        resources :other_users, only: [:index]
      end
    end
  end
end
