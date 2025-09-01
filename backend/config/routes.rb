Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication
      post '/auth/sessions/verify', to: 'auth#verify'
      post '/auth/webhooks/clerk', to: 'auth#clerk_webhook'
      
      # Companies
      resources :companies do
        member do
          get :workflow
        end
        
        # Nested workflow routes
        post 'workflow/start', to: 'workflows#start'
      end
      
      # Workflow steps
      resources :workflow_steps, only: [] do
        member do
          post :complete
          post :run_automation
        end
      end
      
      # Documents
      resources :documents, except: [:edit, :new] do
        member do
          post :ocr
        end
        collection do
          post :upload_url
        end
      end
      
      # Users
      resources :users, only: [:show, :update]
      
      # Requests
      resources :requests
    end
  end
end
