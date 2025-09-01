import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome back! Here's what's happening with your companies."
    >
      {children}
    </DashboardLayout>
  )
}
