import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function CompanyLayoutWrapper({
  children,
  params
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  return (
    <DashboardLayout 
      title="Company Dashboard"
      description="Manage your company formation and operations"
    >
      {children}
    </DashboardLayout>
  )
}
