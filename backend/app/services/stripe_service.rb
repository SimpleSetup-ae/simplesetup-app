require 'stripe'

class StripeService
  class << self
    def initialize_stripe
      Stripe.api_key = ENV['STRIPE_SECRET_KEY']
      Stripe.api_version = '2023-10-16'
    end
    
    def create_customer(email:, name:, metadata: {})
      initialize_stripe
      
      Stripe::Customer.create({
        email: email,
        name: name,
        metadata: metadata
      })
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe customer creation failed: #{e.message}"
      raise e
    end
    
    def get_customer(customer_id)
      initialize_stripe
      
      Stripe::Customer.retrieve(customer_id)
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe customer retrieval failed: #{e.message}"
      nil
    end
    
    def create_payment_intent(amount:, currency: 'aed', customer_id:, description:, metadata: {})
      initialize_stripe
      
      Stripe::PaymentIntent.create({
        amount: (amount * 100).to_i, # Convert to cents
        currency: currency.downcase,
        customer: customer_id,
        description: description,
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true
        }
      })
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe payment intent creation failed: #{e.message}"
      raise e
    end
    
    def get_payment_intent(payment_intent_id)
      initialize_stripe
      
      Stripe::PaymentIntent.retrieve(payment_intent_id)
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe payment intent retrieval failed: #{e.message}"
      nil
    end
    
    def confirm_payment_intent(payment_intent_id, payment_method_id = nil)
      initialize_stripe
      
      params = { payment_intent: payment_intent_id }
      params[:payment_method] = payment_method_id if payment_method_id
      
      Stripe::PaymentIntent.confirm(payment_intent_id, params)
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe payment confirmation failed: #{e.message}"
      raise e
    end
    
    def create_refund(payment_intent_id, amount = nil)
      initialize_stripe
      
      refund_params = { payment_intent: payment_intent_id }
      refund_params[:amount] = (amount * 100).to_i if amount
      
      refund = Stripe::Refund.create(refund_params)
      
      { success: true, refund: refund }
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe refund failed: #{e.message}"
      { success: false, error: e.message }
    end
    
    def create_product_catalog
      initialize_stripe
      
      # IFZA Formation Products
      ifza_formation = create_or_update_product(
        id: 'ifza_company_formation',
        name: 'IFZA Company Formation',
        description: 'Complete company formation in IFZA free zone',
        metadata: { free_zone: 'IFZA', type: 'formation' }
      )
      
      # Create prices for IFZA formation
      create_or_update_price(
        product_id: ifza_formation.id,
        amount: 300000, # 3000 AED in fils (AED smallest unit)
        currency: 'aed',
        nickname: 'IFZA Formation - Total Fee'
      )
      
      # Tax Registration Products
      tax_registration = create_or_update_product(
        id: 'tax_registration',
        name: 'UAE Tax Registration',
        description: 'Corporate Tax and VAT registration services',
        metadata: { type: 'tax_registration' }
      )
      
      create_or_update_price(
        product_id: tax_registration.id,
        amount: 150000, # 1500 AED
        currency: 'aed',
        nickname: 'Tax Registration Fee'
      )
      
      Rails.logger.info "Stripe product catalog created successfully"
    rescue Stripe::StripeError => e
      Rails.logger.error "Failed to create Stripe product catalog: #{e.message}"
      raise e
    end
    
    def get_formation_fee_breakdown(free_zone)
      case free_zone.upcase
      when 'IFZA'
        {
          government_fee: 2500,
          service_fee: 500,
          total: 3000,
          currency: 'AED',
          breakdown: [
            { name: 'Government Fee', amount: 2500, type: 'government' },
            { name: 'Service Fee', amount: 500, type: 'service' }
          ]
        }
      when 'DIFC'
        {
          government_fee: 3500,
          service_fee: 750,
          total: 4250,
          currency: 'AED',
          breakdown: [
            { name: 'Government Fee', amount: 3500, type: 'government' },
            { name: 'Service Fee', amount: 750, type: 'service' }
          ]
        }
      else
        {
          government_fee: 2000,
          service_fee: 500,
          total: 2500,
          currency: 'AED',
          breakdown: [
            { name: 'Government Fee', amount: 2000, type: 'government' },
            { name: 'Service Fee', amount: 500, type: 'service' }
          ]
        }
      end
    end
    
    def verify_webhook_signature(payload, signature, secret)
      Stripe::Webhook.construct_event(payload, signature, secret)
    rescue Stripe::SignatureVerificationError => e
      Rails.logger.error "Stripe webhook signature verification failed: #{e.message}"
      raise e
    end
    
    private
    
    def create_or_update_product(id:, name:, description:, metadata: {})
      begin
        # Try to retrieve existing product
        Stripe::Product.retrieve(id)
      rescue Stripe::InvalidRequestError
        # Product doesn't exist, create it
        Stripe::Product.create({
          id: id,
          name: name,
          description: description,
          metadata: metadata
        })
      end
    end
    
    def create_or_update_price(product_id:, amount:, currency:, nickname:)
      # Check if price already exists
      existing_prices = Stripe::Price.list(product: product_id, active: true)
      
      existing_price = existing_prices.data.find do |price|
        price.unit_amount == amount && price.currency == currency
      end
      
      return existing_price if existing_price
      
      # Create new price
      Stripe::Price.create({
        product: product_id,
        unit_amount: amount,
        currency: currency,
        nickname: nickname
      })
    end
  end
end
