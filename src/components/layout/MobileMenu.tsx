import { Link } from 'react-router-dom'
import { ChevronRight, Heart, LayoutDashboard, User, X } from 'lucide-react'
import { NAV_LINKS } from './Header'
import { useStore } from '@/context/StoreContext'
import { Drawer } from '@/components/ui/Modal'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, wishlistIds } = useStore()
  return (
    <Drawer open={open} onClose={onClose} side="left" title="Menu">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-volt-line px-5 py-4">
          <span className="font-display text-lg font-extrabold uppercase" style={{ fontStretch: '125%' }}>
            VOLTERRA<span className="text-volt-orange">.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center transition-colors hover:bg-volt-mist"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Mobile navigation">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="group flex items-center justify-between px-3 py-3.5 font-display text-base font-bold uppercase tracking-[0.08em] text-volt-black transition-colors hover:bg-volt-mist"
                >
                  {link.label}
                  <ChevronRight className="size-4 text-volt-graphite/40 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-volt-line px-3 pt-6">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.14em] text-volt-graphite/60">
              Account
            </p>
            <div className="mt-2 space-y-1">
              <Link
                to={user ? '/account' : '/login'}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-volt-black hover:bg-volt-mist"
              >
                <User className="size-4" /> {user ? `Hi, ${user.name}` : 'Sign in / Join'}
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-volt-black hover:bg-volt-mist"
              >
                <Heart className="size-4" /> Wishlist
                {wishlistIds.length > 0 && (
                  <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-volt-orange text-[10px] font-bold text-white">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 bg-volt-orange px-3 py-3 text-sm font-bold text-white hover:bg-volt-orange-dark"
                >
                  <LayoutDashboard className="size-4" /> Admin dashboard
                </Link>
              )}
            </div>
          </div>
        </nav>

        <div className="border-t border-volt-line p-5">
          <Link
            to={user ? '/account' : '/signup'}
            className="block w-full bg-volt-black py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-volt-orange"
          >
            {user ? 'My Account' : 'Join VOLTERRA'}
          </Link>
        </div>
      </div>
    </Drawer>
  )
}
