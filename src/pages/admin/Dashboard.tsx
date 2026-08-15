import { useEffect, useState } from 'react'
import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { BarChart, LineChart } from '@/components/admin/Charts'
import { formatPrice } from '@/lib/utils'
import type { DashboardStats } from '@/lib/types'

function shortDay(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.getStats().then(setStats)
  }, [])

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="skeleton h-64" />
          <div className="skeleton h-64" />
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total sales', value: formatPrice(stats.totalSales), icon: DollarSign },
    { label: 'Orders', value: String(stats.orders), icon: ShoppingCart },
    { label: 'Customers', value: String(stats.customers), icon: Users },
    { label: 'Products', value: String(stats.products), icon: Package },
    { label: 'Low stock', value: String(stats.lowStock), icon: AlertTriangle, warn: stats.lowStock > 0 },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="border border-volt-line p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-display font-bold uppercase tracking-[0.12em] text-volt-graphite/60">{c.label}</p>
              <c.icon className={`size-4 ${c.warn ? 'text-volt-orange' : 'text-volt-graphite/40'}`} />
            </div>
            <p className="mt-2 truncate font-display text-xl font-bold sm:text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-volt-line p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-volt-orange" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Revenue — last 14 days</h2>
          </div>
          <BarChart data={stats.revenueByDay.map((d) => ({ label: shortDay(d.day), value: d.revenue }))} />
        </div>
        <div className="border border-volt-line p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="size-4 text-volt-orange" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Orders — last 14 days</h2>
          </div>
          <LineChart data={stats.ordersByDay.map((d) => ({ label: shortDay(d.day), value: d.orders }))} color="#ff4d00" />
        </div>
      </div>

      <div className="border border-volt-line p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Popular products</h2>
        {stats.popularProducts.length === 0 ? (
          <p className="mt-4 text-sm text-volt-graphite/60">No sales data yet — place some orders to see trends here.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {stats.popularProducts.map((p, i) => {
              const max = stats.popularProducts[0]?.sold ?? 1
              return (
                <li key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-display font-bold text-volt-graphite/40">{i + 1}</span>
                  <span className="w-48 truncate font-medium">{p.name}</span>
                  <div className="h-2 flex-1 bg-volt-mist" role="presentation">
                    <div className="h-full bg-volt-black" style={{ width: `${(p.sold / max) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-volt-graphite/60">{p.sold}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
