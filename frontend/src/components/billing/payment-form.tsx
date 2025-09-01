'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

interface PaymentFormProps {
  companyId: string
  amount: number
  currency: string
  paymentType: string
  description: string
  onSuccess?: (payment: any) => void
  onError?: (error: string) => void
}

function PaymentFormContent({ 
  companyId, 
  amount, 
  currency, 
  paymentType, 
  description, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Create payment intent on the backend
      const response = await fetch(`/api/v1/companies/${companyId}/billing/payment_intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, add Authorization header with JWT token
        },
        body: JSON.stringify({
          amount,
          payment_type: paymentType,
          description
        })
      })

      const paymentData = await response.json()

      if (!paymentData.success) {
        throw new Error(paymentData.error || 'Failed to create payment intent')
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.data.payment_intent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Company Owner', // In production, use actual user name
            },
          }
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentData.data.payment)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setPaymentError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <div className="p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {paymentError}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">{description}</p>
          <p className="text-2xl font-bold text-orange-600">
            {amount} {currency}
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-gradient-to-r from-orange-500 to-gray-400 hover:from-orange-600 hover:to-gray-500"
        >
          {isProcessing ? 'Processing...' : `Pay ${amount} ${currency}`}
        </Button>
      </div>
    </form>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}
