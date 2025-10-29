import { DashboardLayout } from '@/components/dashboard-layout'
import { usePathname } from 'next/navigation'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't wrap the main dashboard page with the layout
  // since it has its own black and gold design
  return <>{children}</>
}


