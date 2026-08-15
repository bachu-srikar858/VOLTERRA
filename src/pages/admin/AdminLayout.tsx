import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Boxes, FolderOpen, LayoutDashboard, LogOut, MessageSquare, Package, ShoppingCart, Users } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { useSEO } from '@/lib/seo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
]

export default function AdminLayout() {
  useSEO('Admin', 'VOLTERRA admin dashboard — manage products, orders, customers and inventory.')
  const { user, signOut } = useStore()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="display text-3xl">Admin access</h1>
        <p className="mt-3 max-w-md text-sm text-volt-graphite/70">Sign in to an admin account to manage the store.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>Sign in</Button>
      </div>
    )
  }

  if (!user.isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="display text-3xl">Not authorized</h1>
        <p className="mt-3 max-w-md text-sm text-volt-graphite/70">This area is restricted to store administrators.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>Back home</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl sm:text-4xl">Admin</h1>
          <p className="mt-1 text-xs text-volt-graphite/60">Signed in as {user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate('/') }}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto border-y border-volt-line py-2 lg:flex-col lg:border-0 lg:py-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-volt-black text-white' : 'text-volt-graphite hover:bg-volt-mist',
                )
              }
            >
              <item.icon className="size-4" /> {item.label}
            </NavLink>
          ))}
          <Link to="/" className="flex shrink-0 items-center gap-2.5 px-4 py-3 text-sm font-medium text-volt-graphite hover:bg-volt-mist">
            <BarChart3 className="size-4" /> View store
          </Link>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
