Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Devise routes for authentication
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication
      get '/auth/me', to: 'auth#me'
      post '/auth/sign_in', to: 'auth#login'
      delete '/auth/sign_out', to: 'auth#sign_out'
      
      # Dashboard
      get '/dashboard', to: 'dashboard#show'
      
      # OTP Authentication
      post '/auth/check_user', to: 'otp#check_user'
      post '/auth/register', to: 'otp#register'
      post '/auth/send_otp', to: 'otp#send_otp'
      post '/auth/verify_otp', to: 'otp#verify_otp'
      post '/auth/resend_otp', to: 'otp#resend_otp'
      
      # Applications (New Sign-up Flow)
      resources :applications do
        member do
          patch :progress
          post :claim
          post :submit
        end
        collection do
          get 'admin', to: 'applications#admin_index'
          get 'admin/:id', to: 'applications#admin_show'
          patch 'admin/:id', to: 'applications#admin_update'
        end
        
        # Nested document routes for applications
        resources :documents do
          collection do
            post :extract_passport
          end
        end
      end
      
      # Pricing
      get '/pricing/quote', to: 'pricing#quote'
      get '/pricing/catalog', to: 'pricing#catalog'
      
      # Translations
      post '/translations/arabic', to: 'translations#arabic'
      get '/translations/limit', to: 'translations#limit'
      
      # Companies
      resources :companies do
        member do
          get :workflow
          get :form_state
          patch :auto_save
          post :form_data, to: 'companies#update_form_data'
          post :merge_auto_save
          get :dashboard, to: 'dashboard#show'
          patch :owner_details, to: 'companies#update_owner_details'
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
