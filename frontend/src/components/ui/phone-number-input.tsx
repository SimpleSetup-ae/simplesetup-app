'use client'

import * as React from 'react'
import { Check, ChevronDown, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  countryCodes, 
  getCountryByDialCode,
  getPopularCountries,
  formatPhoneNumber 
} from '@/lib/country-codes'

export interface PhoneNumberValue {
  countryCode: string;
  phoneNumber: string;
  formatted: string;
}

export interface PhoneNumberInputProps {
  value?: PhoneNumberValue;
  onChange?: (value: PhoneNumberValue) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneNumberInput({
  value,
  onChange,
  onBlur,
  error,
  label = "Phone Number",
  placeholder = "50 123 4567",
  required = false,
  disabled = false,
  className
}: PhoneNumberInputProps) {
  const [phoneNumber, setPhoneNumber] = React.useState(value?.phoneNumber || "")
  const [selectedCountry, setSelectedCountry] = React.useState<any>(
    value?.countryCode ? getCountryByDialCode(value.countryCode) : getCountryByDialCode("+971")
  )

  // Handle country selection
  const handleCountrySelect = (dialCode: string) => {
    const country = getCountryByDialCode(dialCode);
    if (!country) return;
    
    setSelectedCountry(country);
    
    // Format and notify parent
    const formatted = formatPhoneNumber(phoneNumber, country.dialCode);
    onChange?.({
      countryCode: country.dialCode,
      phoneNumber: phoneNumber,
      formatted: `${country.dialCode} ${formatted}`
    });
  }

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits);
    
    if (selectedCountry) {
      const formatted = formatPhoneNumber(digits, selectedCountry.dialCode);
      onChange?.({
        countryCode: selectedCountry.dialCode,
        phoneNumber: digits,
        formatted: `${selectedCountry.dialCode} ${formatted}`
      });
    }
  }

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!phoneNumber) return '';
    return formatPhoneNumber(phoneNumber, selectedCountry?.dialCode);
  }, [phoneNumber, selectedCountry]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <Select
          value={selectedCountry?.dialCode || ""}
          onValueChange={handleCountrySelect}
          disabled={disabled}
        >
          <SelectTrigger 
            className={cn(
              "w-[140px]",
              error && "border-red-500"
            )}
          >
            <SelectValue>
              {selectedCountry ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Select</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {/* Popular Countries */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Popular
            </div>
            {getPopularCountries().map((country) => (
              <SelectItem 
                key={country.code} 
                value={country.dialCode}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {country.dialCode}
                  </span>
                </div>
              </SelectItem>
            ))}
            
            {/* Separator */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              All Countries
            </div>
            
            {/* All Countries */}
            {countryCodes
              .filter(c => !getPopularCountries().find(p => p.code === c.code))
              .map((country) => (
                <SelectItem 
                  key={country.code} 
                  value={country.dialCode}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm">{country.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {country.dialCode}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <Input
            type="tel"
            value={displayValue}
            onChange={handlePhoneChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled || !selectedCountry}
            className={cn(
              "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
          />
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {!selectedCountry && (
        <p className="text-sm text-muted-foreground">
          Select a country code to enter phone number
        </p>
      )}
    </div>
  );
}