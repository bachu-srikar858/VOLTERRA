import { useEffect, useState } from 'react'
import { api, demoAdminDB } from '@/lib/api'
import { formatPrice, initials } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'

export default function AdminCustomers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [orderEmails, setOrderEmails] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    ;(async () => {
      const db = demoAdminDB()
      setUsers(db.users)
      const orders = await api.getOrders(null)
      const map = new Map<string, number>()
      for (const o of orders) {
        map.set(o.email.toLowerCase(), (map.get(o.email.toLowerCase()) ?? 0) + 1)
      }
      setOrderEmails(map)
    })()
  }, [])

  type Row = {
    id: string
    name: string
    email: string
    orders: number
    joined: string
    admin: boolean
  }

  const rows: Row[] = [
    ...users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      orders: orderEmails.get(u.email.toLowerCase()) ?? 0,
      joined: u.createdAt,
      admin: u.isAdmin,
    })),
    ...[...orderEmails.entries()].flatMap(([email, count]) => {
      const existing = users.find((u) => u.email.toLowerCase() === email)
      if (existing) return []
      return [{
        id: email,
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        orders: count,
        joined: '',
        admin: false,
      }]
    }),
  ].sort((a, b) => b.orders - a.orders)

  return (
    <div>
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.08em]">Customers ({rows.length})</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border border-volt-line text-sm">
          <thead>
            <tr className="bg-volt-smoke text-left text-[11px] font-display font-bold uppercase tracking-[0.1em] text-volt-graphite/70">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-volt-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-volt-smoke/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center bg-volt-black text-[11px] font-bold text-white">
                      {initials(r.name)}
                    </span>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-volt-graphite/60">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{r.orders}</td>
                <td className="px-4 py-3 text-xs text-volt-graphite/60">
                  {r.joined ? new Date(r.joined).toLocaleDateString() : 'Guest'}
                </td>
                <td className="px-4 py-3">
                  {r.admin ? (
                    <span className="bg-volt-black px-2 py-1 text-[10px] font-bold uppercase text-white">Admin</span>
                  ) : (
                    <span className="border border-volt-line px-2 py-1 text-[10px] font-bold uppercase text-volt-graphite/60">Customer</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-volt-graphite/60">
                  No customers yet — {formatPrice(0)}. Sign up and place an order to see customers here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-volt-graphite/60">
        Demo mode shows local accounts plus customers from order history.
      </p>
    </div>
  )
}
