'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, AlertCircle, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react'
import { apiGet } from '@/lib/api'

interface TaxCalendarEvent {
  type: string
  title: string
  description: string
  due_date: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
  tax_type: 'corporate_tax' | 'vat' | 'excise'
  company_id: string
  notes: string
}

interface TaxCalendarData {
  data: TaxCalendarEvent[]
  company: {
    id: string
    name: string
    incorporation_date?: string
    licence_issue_date?: string
  }
  generated_at: string
}

interface TaxCalendarProps {
  monthsAhead?: number
}

export default function TaxCalendar({ monthsAhead = 6 }: TaxCalendarProps) {
  const [calendarData, setCalendarData] = useState<TaxCalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTaxCalendar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiGet(`/tax_registrations/tax_calendar?months_ahead=${monthsAhead}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tax calendar')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setCalendarData(result)
      } else {
        throw new Error(result.error || 'Failed to fetch tax calendar')
      }
    } catch (err) {
      console.error('Error fetching tax calendar:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tax calendar')
    } finally {
      setLoading(false)
    }
  }, [monthsAhead])

  useEffect(() => {
    fetchTaxCalendar()
  }, [fetchTaxCalendar])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTaxTypeColor = (taxType: string) => {
    switch (taxType) {
      case 'corporate_tax': return 'bg-purple-100 text-purple-800'
      case 'vat': return 'bg-green-100 text-green-800'
      case 'excise': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaxTypeDisplayName = (taxType: string) => {
    switch (taxType) {
      case 'corporate_tax': return 'Corporate Tax'
      case 'vat': return 'VAT'
      case 'excise': return 'Excise Tax'
      default: return taxType.replace('_', ' ').toUpperCase()
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'high': return <Clock className="h-4 w-4 text-orange-600" />
      case 'medium': return <Calendar className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AE', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDaysUntil = (dateString: string) => {
    const dueDate = new Date(dateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due Today'
    if (diffDays === 1) return '1 day'
    return `${diffDays} days`
  }

  const getUpcomingEvents = () => {
    if (!calendarData?.data) return []
    
    const today = new Date()
    const nextThreeMonths = new Date()
    nextThreeMonths.setMonth(nextThreeMonths.getMonth() + 3)
    
    return calendarData.data.filter(event => {
      const eventDate = new Date(event.due_date)
      return eventDate >= today && eventDate <= nextThreeMonths
    }).slice(0, 5) // Show max 5 upcoming events
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              UAE Tax Calendar
            </CardTitle>
            <CardDescription>
              Upcoming tax deadlines and compliance dates
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTaxCalendar}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading tax calendar...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchTaxCalendar} variant="outline">
              Try Again
            </Button>
          </div>
        ) : !calendarData?.data || calendarData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-2">No upcoming tax deadlines</p>
                <p className="text-sm text-gray-500">
                  Tax calendar will show deadlines based on your company&apos;s registration status
                </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getUpcomingEvents().map((event, index) => (
              <div 
                key={`${event.type}-${event.due_date}-${index}`}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  event.urgency === 'critical' ? 'border-red-200 bg-red-50' :
                  event.urgency === 'high' ? 'border-orange-200 bg-orange-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getUrgencyIcon(event.urgency)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{event.title}</p>
                      <Badge className={getTaxTypeColor(event.tax_type)}>
                        {getTaxTypeDisplayName(event.tax_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                    {event.notes && (
                      <p className="text-xs text-gray-500">{event.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDate(event.due_date)}</p>
                  <div className="flex items-center gap-1">
                    <Badge className={getUrgencyColor(event.urgency)}>
                      {getDaysUntil(event.due_date)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {calendarData.data.length > 5 && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Showing next 5 deadlines • {calendarData.data.length} total in next {monthsAhead} months
                </p>
                <Button variant="outline" size="sm">
                  View Full Calendar
                </Button>
              </div>
            )}
            
            {calendarData.company && (
              <div className="text-xs text-gray-500 pt-4 border-t">
                <p>Calendar generated for {calendarData.company.name}</p>
                <p>Last updated: {new Date(calendarData.generated_at).toLocaleString('en-AE')}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
