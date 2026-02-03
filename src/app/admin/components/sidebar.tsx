'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bike, FileText, Users, Calendar, DollarSign, Settings, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/listings', icon: Bike, label: 'Listings' },
  { href: '/admin/applications', icon: FileText, label: 'Applications' },
  { href: '/admin/service-bookings', icon: Calendar, label: 'Service Bookings' },
  { href: '/admin/sell-requests', icon: DollarSign, label: 'Sell/Trade Requests' },
  { href: '/admin/leads', icon: Users, label: 'Leads' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface AdminSidebarProps {
  active?: string
}

export default function AdminSidebar({ active }: AdminSidebarProps) {
  const pathname = usePathname()
  const currentPath = active || pathname

  return (
    <aside className="w-64 bg-background border-r min-h-screen p-4 hidden lg:block">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gomoto-500 to-gomoto-600 flex items-center justify-center">
          <Bike className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-display font-bold">Go-Moto</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href || 
            (item.href !== '/admin' && currentPath.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted',
                isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Site
        </Link>
      </div>
    </aside>
  )
}
