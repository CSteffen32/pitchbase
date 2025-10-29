'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleSignIn = () => {
    router.push('/auth/signin')
    setIsMenuOpen(false)
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">PitchBase</h1>
          </Link>

          <div className="relative" ref={menuRef}>
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
                <div className="py-1">
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-accent transition-colors w-full text-left"
                  >
                    Pitches
                  </Link>
                  
                  {session ? (
                    <>
                      <Link
                        href="/dashboard/pitches/new"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 text-sm hover:bg-accent transition-colors w-full text-left"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>New Pitch</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut()
                        }}
                        className="block px-4 py-3 text-sm hover:bg-accent transition-colors w-full text-left"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="block px-4 py-3 text-sm hover:bg-accent transition-colors w-full text-left"
                    >
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Author</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
