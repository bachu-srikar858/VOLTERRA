import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { Select } from '@/components/ui/Field'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const { toast } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setOrders(await api.getOrders(null))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      toast(`Order ${id.slice(-6)} → ${status}`, 'info')
    } catch (e) {
      toast('Could not update order', 'error')
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.08em]">Orders ({orders.length})</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] border border-volt-line text-sm">
          <thead>
            <tr className="bg-volt-smoke text-left text-[11px] font-display font-bold uppercase tracking-[0.1em] text-volt-graphite/70">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-volt-line">
            {orders.map((o) => (
              <tr key={o.id} className="align-top hover:bg-volt-smoke/50">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-semibold">{o.id}</p>
                  <p className="mt-0.5 text-xs text-volt-graphite/60">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.shippingAddress.fullName}</p>
                  <p className="text-xs text-volt-graphite/60">{o.email}</p>
                  <p className="text-xs text-volt-graphite/50">{o.shippingAddress.city}, {o.shippingAddress.state}</p>
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-1">
                    {o.items.map((it, i) => (
                      <li key={i} className="text-xs">
                        {it.name} × {it.quantity} <span className="text-volt-graphite/50">({it.size})</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide bg-volt-smo
ke\">{o.paymentMethod}</span>
                </td>
                <td className="px-4 py-3">
                  <Select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)} aria-label={`Status for order ${o.id}`} className="px-3 py-1.5 text-xs">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-volt-graphite/60">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
