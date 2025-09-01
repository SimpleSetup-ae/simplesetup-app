import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PaymentForm from '@/components/billing/payment-form'

interface BillingPageProps {
  params: {
    id: string
  }
}

export default async function BillingPage({ params }: BillingPageProps) {
  const companyId = params.id

  // In production, this would fetch billing data from the API
  const billingData = {
    company: {
      id: companyId,
      name: 'Sample Tech Solutions LLC',
      free_zone: 'IFZA'
    },
    formation_fees: {
      government_fee: 2500,
      service_fee: 500,
      total: 3000,
      currency: 'AED',
      breakdown: [
        { name: 'Government Fee', amount: 2500, type: 'government' },
        { name: 'Service Fee', amount: 500, type: 'service' }
      ]
    },
    payments: [
      {
        id: '1',
        payment_type: 'formation_fee',
        amount: 3000,
        currency: 'AED',
        status: 'pending',
        description: 'IFZA Company Formation Fees',
        created_at: '2024-01-15T10:00:00Z'
      }
    ]
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Payments</h1>
        <p className="text-gray-600">Manage payments for {billingData.company.name}</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Fee Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Formation Fees</CardTitle>
            <CardDescription>
              {billingData.company.free_zone} company formation fees breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billingData.formation_fees.breakdown.map((fee, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{fee.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{fee.type} fee</p>
                </div>
                <p className="font-semibold">{fee.amount} {billingData.formation_fees.currency}</p>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-600">
                {billingData.formation_fees.total} {billingData.formation_fees.currency}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete your payment to proceed with company formation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm
              companyId={companyId}
              amount={billingData.formation_fees.total}
              currency={billingData.formation_fees.currency}
              paymentType="formation_fee"
              description="IFZA Company Formation Fees"
              onSuccess={(payment) => {
                alert('Payment successful! Your company formation will now proceed.')
                // In production, redirect to next step
              }}
              onError={(error) => {
                console.error('Payment failed:', error)
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View all payments for this company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingData.payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No payments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingData.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString()} • {payment.payment_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{payment.amount} {payment.currency}</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
