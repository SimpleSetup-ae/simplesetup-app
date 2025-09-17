'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useApplication } from '@/contexts/ApplicationContext'

interface PriceItem {
  code: string
  label: string
  amount: number
  amountFmt: string
}

interface PricingQuote {
  total: number
  totalFormatted: string
  items: PriceItem[]
  currency: string
}

export function PricingBanner() {
  const { applicationData } = useApplication()
  const [quote, setQuote] = useState<PricingQuote | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const fetchQuote = async () => {
      if (!applicationData.id) return
      
      setLoading(true)
      
      try {
        const response = await fetch(`/api/v1/pricing/quote?application_id=${applicationData.id}`)
        const data = await response.json()
        
        if (data.success) {
          setQuote({
            total: data.quote.total,
            totalFormatted: data.totalFormatted,
            items: data.items,
            currency: data.quote.currency || 'AED'
          })
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err)
      } finally {
        setLoading(false)
      }
    }
    
    // Fetch initially
    fetchQuote()
    
    // Set up polling interval
    const interval = setInterval(fetchQuote, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [
    applicationData.id,
    applicationData.trade_license_validity,
    applicationData.visa_package,
    applicationData.inside_country_visas,
    applicationData.outside_country_visas,
    applicationData.partner_visa_count,
    applicationData.establishment_card
  ])
  
  if (loading && !quote) {
    return (
      <Card className="sticky top-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!quote) {
    return null
  }
  
  return (
    <Card className="sticky top-6 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Estimated Total
            </h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {quote.totalFormatted}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                + VAT (5%)
              </span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Cost Breakdown
            </h4>
            <ul className="space-y-2">
              {quote.items.map((item) => (
                <li 
                  key={item.code} 
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600">
                    {item.label}
                  </span>
                  <span className="font-medium text-gray-900">
                    {item.amountFmt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {quote.items.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Subtotal
                </span>
                <span className="font-semibold text-gray-900">
                  {quote.totalFormatted}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-500">
                  VAT (5%)
                </span>
                <span className="text-sm text-gray-600">
                  AED {Math.round(quote.total * 0.05).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="font-medium text-gray-700">
                  Total
                </span>
                <span className="text-lg font-bold text-blue-600">
                  AED {Math.round(quote.total * 1.05).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This is an estimate. Final costs may vary based on 
              additional requirements or government fee changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
