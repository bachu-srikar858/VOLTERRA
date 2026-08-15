import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { Logo } from './Logo'
import { useStore } from '@/context/StoreContext'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'

export const NAV_LINKS = [
  { label: 'New & Featured', to: '/shop?sort=newest' },
  { label: 'Men', to: '/shop?gender=men' },
  { label: 'Women', to: '/shop?gender=women' },
  { label: 'Kids', to: '/shop?gender=kids' },
  { label: 'Collections', to: '/collections' },
  { label: 'Sale', to: '/shop?sale=1' },
]

export function Header() {
  const { cartCount, wishlistIds, setCartOpen, setSearchOpen, user } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const transparent = useMemo(() => {
    return location.pathname === '/' && !scrolled
  }, [location.pathname, scrolled])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const iconBtn =
    'relative flex size-10 items-center justify-center transition-colors ' +
    (transparent ? 'text-white hover:bg-white/10' : 'text-volt-black hover:bg-volt-mist')

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'bg-white/95 shadow-[0_1px_0_0_var(--color-volt-line)] backdrop-blur-sm' : transparent ? 'bg-transparent' : 'bg-white',
          scrolled ? 'py-0' : 'py-1',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-10',
            scrolled ? 'h-14' : 'h-16 lg:h-20',
          )}
        >
          {/* Mobile: hamburger */}
          <button
            type="button"
            className={cn(iconBtn, 'lg:hidden')}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-6" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'font-display text-[13px] font-bold uppercase tracking-[0.1em] transition-colors duration-200',
                  transparent ? 'text-white/90 hover:text-volt-orange' : 'text-volt-black/80 hover:text-volt-orange',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo — centered on mobile */}
          <Link to="/" className={cn('lg:hidden', transparent ? 'text-white' : 'text-volt-black')} aria-label="VOLTERRA home">
            <span className="font-display text-xl font-extrabold uppercase" style={{ fontStretch: '125%' }}>
              VOLTERRA<span className="text-volt-orange">.</span>
            </span>
          </Link>

          <div className="hidden lg:block">
            <Logo dark={transparent} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              className={iconBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <Search className="size-5" />
            </button>
            <Link to="/wishlist" className={iconBtn} aria-label="Wishlist">
              <Heart className="size-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-volt-orange text-[9px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link
              to={user ? '/account' : '/login'}
              className={cn(iconBtn, 'hidden sm:flex')}
              aria-label={user ? 'My account' : 'Sign in'}
            >
              <User className="size-5" />
            </Link>
            <button
              type="button"
              className={iconBtn}
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-volt-orange text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
