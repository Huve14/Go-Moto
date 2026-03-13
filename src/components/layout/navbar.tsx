'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Inventory', href: '/inventory' },
  { name: 'Service', href: '/service' },
  { name: 'List Your Bike', href: '/list-your-bike' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Fleet', href: '/fleet' },
]

function MobileMenu({
  isOpen,
  onClose,
  navigation,
  pathname,
  user,
  isAdmin,
  onSignOut,
}: {
  isOpen: boolean
  onClose: () => void
  navigation: { name: string; href: string }[]
  pathname: string
  user: SupabaseUser | null
  isAdmin: boolean
  onSignOut: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="lg:hidden fixed inset-0 z-[9999]">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full overflow-y-auto bg-[#07080f] border-l border-white/8 px-6 py-6 sm:max-w-sm shadow-2xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-[#E53935] flex items-center justify-center">
              <span className="text-white font-bold text-base">GM</span>
            </div>
            <span className="font-display text-xl font-bold text-white">Go-Moto</span>
          </Link>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-white/70 hover:text-white transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-white/8">
            <div className="space-y-1 py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    '-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 transition-colors',
                    pathname === item.href
                      ? 'text-white bg-white/8'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="py-6 space-y-3">
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={onClose}
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={onClose}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      onSignOut()
                      onClose()
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-red-400 hover:bg-white/5 w-full text-left transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={onClose}
                >
                  Sign In
                </Link>
              )}
              <Button asChild className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-semibold rounded-xl py-6">
                <Link href="/apply" onClick={onClose}>
                  Apply Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-500',
          scrolled
            ? 'bg-[#07080f]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]'
            : 'bg-transparent'
        )}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E53935] flex items-center justify-center shadow-[0_0_12px_rgba(229,57,53,0.4)]">
                  <span className="text-white font-bold text-base tracking-tight">GM</span>
                </div>
                <span className="font-display text-xl font-bold text-white">Go-Moto</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    pathname === item.href
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA + Auth */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-3">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 text-white/70 hover:text-white hover:bg-white/8">
                      <User className="h-4 w-4" />
                      <span>{profile?.full_name || user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#0f1018] border-white/10 text-white/80">
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller">Seller Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/favorites">Saved Bikes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/applications">My Applications</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" asChild className="text-white/70 hover:text-white hover:bg-white/8">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
              <Button asChild className="bg-[#E53935] hover:bg-[#C62828] text-white font-semibold rounded-lg shadow-[0_0_12px_rgba(229,57,53,0.3)] hover:shadow-[0_0_20px_rgba(229,57,53,0.4)] transition-all duration-300">
                <Link href="/apply">Apply Now</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
        pathname={pathname}
        user={user}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />
    </>
  )
}
