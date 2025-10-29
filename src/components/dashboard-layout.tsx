'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileText, Plus, Tags, Settings, BarChart3, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Pitches', href: '/', icon: FileText },
  { name: 'New Pitch', href: '/dashboard/pitches/new', icon: Plus },
  { name: 'Tags', href: '/dashboard/tags', icon: Tags },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR') {
      router.push('/')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">PitchBase Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>

          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              {navigation.map(item => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="px-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/')}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              View Public Site
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}


