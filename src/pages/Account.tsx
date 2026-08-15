import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Heart, LayoutDashboard, LogOut, MapPin, Package, Settings, User as UserIcon } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { useSEO } from '@/lib/seo'
import type { Order } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AddressesTab, OrdersTab, PaymentsTab, ProfileTab, SettingsTab, TabHeader } from '@/components/account/AccountTabs'

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'payments' | 'settings'

const TABS: { id: Tab; label: string; icon: typeof UserIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payment methods', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Account() {
  useSEO('My Account', 'Manage your VOLTERRA account: profile, orders, wishlist, addresses and payments.')
  const { user, signOut, refreshSession, wishlistIds } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (tab === 'orders' && user) {
      setOrdersLoading(true)
      api.getOrders(user.id).then((list) => {
        setOrders(list)
        setOrdersLoading(false)
      })
    }
  }, [tab, user])

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl sm:text-5xl">My Account</h1>
          <p className="mt-2 text-sm text-volt-graphite/70">
            Welcome back, <strong>{user.name}</strong> · {user.email}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate('/') }}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Nav */}
        <nav aria-label="Account sections" className="flex gap-1 overflow-x-auto border-y border-volt-line py-2 lg:flex-col lg:border-0 lg:py-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
              className={cn(
                'flex shrink-0 items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors',
                tab === t.id ? 'bg-volt-black text-white' : 'text-volt-graphite hover:bg-volt-mist',
              )}
            >
              <t.icon className="size-4" />
              {t.label}
              {t.id === 'orders' && orders.length > 0 && (
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-volt-orange text-[10px] font-bold text-white">{orders.length}</span>
              )}
            </button>
          ))}
          {user.isAdmin && (
            <Link
              to="/admin"
              className="flex shrink-0 items-center gap-2.5 bg-volt-orange px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-volt-orange-dark lg:mt-2"
            >
              <LayoutDashboard className="size-4" />
              Admin dashboard
            </Link>
          )}
        </nav>

        <div className="min-w-0">
          {tab === 'profile' && <ProfileTab user={user} onSaved={refreshSession} />}
          {tab === 'orders' && (
            <OrdersTab orders={orders} loading={ordersLoading} />
          )}
          {tab === 'wishlist' && (
            <div>
              <TabHeader title="Wishlist" count={wishlistIds.length} />
              <Link to="/wishlist" className="text-sm font-semibold text-volt-black underline-offset-4 hover:underline">
                Manage full wishlist →
              </Link>
            </div>
          )}
          {tab === 'addresses' && <AddressesTab />}
          {tab === 'payments' && <PaymentsTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}
