/**
 * @deprecated This is a test form page.
 * Please use the NEW production form at: /application/new
 * This test page will be removed in the next release.
 */

'use client'

import { CompanyFormationWizard } from '@/components/forms/company-formation'

/**
 * Test page for the new Company Formation form
 * Allows us to test the elegant abstractions and design consistency
 */
export default function TestFormPage() {
  // Mock company ID for testing
  const mockCompanyId = "test-123";
  
  return (
    <div>
      <CompanyFormationWizard 
        companyId={mockCompanyId}
        freezone="IFZA"
      />
    </div>
  );
}
