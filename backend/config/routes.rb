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
          get :form_state
          patch :auto_save
          post :form_data, to: 'companies#update_form_data'
          post :merge_auto_save
          get :dashboard, to: 'dashboard#show'
        end
        
        # Nested resources
        resources :documents, except: [:new, :edit] do
          member do
            get :download
          end
        end
        
        # Nested workflow routes
        post 'workflow/start', to: 'workflows#start'
      end
      
      # Standalone document routes (for direct access)
      resources :documents, only: [:show, :destroy] do
        member do
          get :download
        end
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
          
          # Passport-specific endpoints
          post 'passport/extract', to: 'passport#extract'
          post 'passport/fraud-check', to: 'passport#fraud_check'
        end
      end
      
      # Users
      resources :users, only: [:show, :update]
      
      # Billing
      resources :companies, only: [] do
        member do
          get 'billing', to: 'billing#show'
          post 'billing/payment_intent', to: 'billing#create_payment_intent'
        end
      end
      
      # Stripe webhooks
      post '/webhooks/stripe', to: 'billing#webhook'
      
      # Requests
      resources :requests
      
      # Business Activities
      resources :business_activities, only: [:index, :show] do
        collection do
          get :search
          get :filters
        end
      end
      
      # Form Configurations
      resources :form_configs, param: :freezone, only: [:show] do
        collection do
          get :freezones
        end
        member do
          post :validate
          get :business_rules
        end
      end
      
      # Notifications
      resources :notifications, only: [:index, :show] do
        member do
          post :mark_read
        end
        collection do
          post :mark_all_read
          get :summary
        end
      end
    end
  end
end
