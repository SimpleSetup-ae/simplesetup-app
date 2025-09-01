class Api::V1::BillingController < ApplicationController
  before_action :set_company
  before_action :authorize_billing_access
  
  def show
    billing_account = @company.billing_account
    
    render json: {
      success: true,
      data: {
        billing_account: serialize_billing_account(billing_account),
        payments: @company.payments.order(created_at: :desc).limit(10).map { |p| serialize_payment(p) },
        formation_fees: StripeService.get_formation_fee_breakdown(@company.free_zone)
      }
    }
  end
  
  def create_payment_intent
    amount = params[:amount].to_f
    payment_type = params[:payment_type]
    description = params[:description]
    
    # Validate amount
    unless @company.billing_account.can_charge?(amount)
      return render json: {
        success: false,
        error: 'Invalid payment amount'
      }, status: :unprocessable_entity
    end
    
    # Ensure Stripe customer exists
    @company.billing_account.create_stripe_customer! unless @company.billing_account.stripe_customer_id
    
    begin
      # Create payment record
      payment = @company.payments.create!(
        payment_type: payment_type,
        amount: amount,
        currency: 'AED',
        description: description,
        status: 'pending'
      )
      
      # Create Stripe payment intent
      payment_intent = StripeService.create_payment_intent(
        amount: amount,
        currency: 'aed',
        customer_id: @company.billing_account.stripe_customer_id,
        description: description,
        metadata: {
          company_id: @company.id,
          payment_id: payment.id,
          payment_type: payment_type
        }
      )
      
      # Update payment with Stripe payment intent ID
      payment.update!(stripe_payment_intent_id: payment_intent.id)
      
      render json: {
        success: true,
        data: {
          payment_intent: {
            id: payment_intent.id,
            client_secret: payment_intent.client_secret,
            amount: payment_intent.amount,
            currency: payment_intent.currency,
            status: payment_intent.status
          },
          payment: serialize_payment(payment)
        }
      }
      
    rescue => e
      Rails.logger.error "Payment intent creation failed: #{e.message}"
      render json: {
        success: false,
        error: 'Failed to create payment intent',
        details: e.message
      }, status: :internal_server_error
    end
  end
  
  def webhook
    payload = request.body.read
    signature = request.headers['Stripe-Signature']
    
    begin
      event = StripeService.verify_webhook_signature(
        payload, 
        signature, 
        ENV['STRIPE_WEBHOOK_SECRET']
      )
      
      case event.type
      when 'payment_intent.succeeded'
        handle_payment_succeeded(event.data.object)
      when 'payment_intent.payment_failed'
        handle_payment_failed(event.data.object)
      when 'payment_intent.canceled'
        handle_payment_cancelled(event.data.object)
      end
      
      render json: { success: true }
    rescue => e
      Rails.logger.error "Stripe webhook error: #{e.message}"
      render json: { error: e.message }, status: :bad_request
    end
  end
  
  private
  
  def set_company
    @company = current_user.companies.find(params[:company_id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Company not found or access denied'
    }, status: :not_found
  end
  
  def authorize_billing_access
    user_role = current_user.role_for_company(@company)
    
    unless %w[owner admin].include?(user_role)
      render json: {
        success: false,
        error: 'Billing access denied'
      }, status: :forbidden
    end
  end
  
  def serialize_billing_account(billing_account)
    {
      id: billing_account.id,
      stripe_customer_id: billing_account.stripe_customer_id,
      billing_email: billing_account.billing_email,
      account_balance: billing_account.account_balance,
      currency: billing_account.currency,
      has_payment_method: billing_account.has_payment_method?,
      total_paid: billing_account.total_paid,
      total_pending: billing_account.total_pending
    }
  end
  
  def serialize_payment(payment)
    {
      id: payment.id,
      payment_type: payment.payment_type,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      created_at: payment.created_at.iso8601,
      paid_at: payment.paid_at&.iso8601,
      failed_at: payment.failed_at&.iso8601,
      failure_reason: payment.failure_reason,
      formatted_amount: payment.formatted_amount,
      can_be_refunded: payment.can_be_refunded?,
      can_be_cancelled: payment.can_be_cancelled?
    }
  end
  
  def handle_payment_succeeded(payment_intent)
    payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment
    
    payment.mark_as_paid!
    Rails.logger.info "Payment succeeded: #{payment.id}"
  end
  
  def handle_payment_failed(payment_intent)
    payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment
    
    payment.mark_as_failed!(payment_intent.last_payment_error&.message)
    Rails.logger.info "Payment failed: #{payment.id}"
  end
  
  def handle_payment_cancelled(payment_intent)
    payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment
    
    payment.update!(status: 'cancelled')
    Rails.logger.info "Payment cancelled: #{payment.id}"
  end
end
