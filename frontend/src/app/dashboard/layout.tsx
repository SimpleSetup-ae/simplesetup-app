import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <DashboardLayout 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your companies."
      >
        {children}
      </DashboardLayout>
    </AuthGuard>
  )
}
