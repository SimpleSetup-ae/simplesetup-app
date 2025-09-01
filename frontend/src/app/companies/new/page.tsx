import CompanyFormationForm from '@/components/forms/company-formation-form'

// Temporarily disable auth check for testing
export default async function NewCompanyPage() {

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Company</h1>
        <p className="text-gray-600">Start your UAE company formation process</p>
      </div>
      
      <CompanyFormationForm />
    </div>
  )
}
