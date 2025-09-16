'use client'

import { CompanyFormationWizard } from '@/components/forms/company-formation-v2'

export default function CompanyFormationV2Page() {
  // Generate a test company ID
  const testCompanyId = 'test-company-' + Date.now()

  return (
    <div className="min-h-screen">
      <CompanyFormationWizard 
        companyId={testCompanyId}
        freezone="IFZA"
      />
    </div>
  )
}
