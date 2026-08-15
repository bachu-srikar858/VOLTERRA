import { useState } from 'react'
import { CreditCard, MapPin, Package, Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { createDemoAddress, createDemoPayment } from '@/lib/demo/db'
import { formatDate, formatPrice, initials } from '@/lib/utils'
import type { Address, Order, PaymentMethod, UserProfile } from '@/lib/types'

export function TabHeader({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em]">
      {title} {count != null && <span className="text-volt-graphite/50">({count})</span>}
    </h2>
  )
}

export function ProfileTab({ user, onSaved }: { user: UserProfile; onSaved: () => void }) {
  const { toast } = useStore()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) {
      toast('Name cannot be empty', 'error')
      return
    }
    setSaving(true)
    try {
      await api.updateProfile(user.id, { name: name.trim(), phone: phone.trim() || undefined })
      onSaved()
      toast('Profile updated')
    } catch {
      toast('Could not update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <TabHeader title="Profile" />
      <div className="mt-6 flex items-center gap-4">
        <span className="flex size-14 items-center justify-center bg-volt-black font-display text-lg font-bold text-white">
          {initials(user.name)}
        </span>
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-volt-graphite/70">{user.email}</p>
        </div>
      </div>
      <div className="mt-8 max-w-md space-y-4">
        <Field label="Full name" id="acc-name">
          <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Phone" id="acc-phone" hint="Used for delivery updates.">
          <Input id="acc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0100" />
        </Field>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
}

export function OrdersTab({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div>
        <TabHeader title="Orders" />
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        message="When you place an order it will appear here with live tracking updates."
        action={undefined}
      />
    )
  }
  return (
    <div>
      <TabHeader title="Orders" count={orders.length} />
      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="border border-volt-line">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-volt-line bg-volt-smoke/50 px-5 py-3">
              <div>
                <p className="font-mono text-xs font-semibold">{o.id}</p>
                <p className="mt-0.5 text-xs text-volt-graphite/60">Placed {formatDate(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>
                  {o.status}
                </span>
                <p className="font-display text-base font-bold">{formatPrice(o.total)}</p>
              </div>
            </div>
            <ul className="divide-y divide-volt-line">
              {o.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-3">
                  <img src={it.image} alt={it.name} className="w-12 bg-volt-mist object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-volt-graphite/60">{it.color} · {it.size} · Qty {it.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AddressesTab() {
  const { user, toast, refreshSession } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Omit<Address, 'id'>>({ fullName: user?.name ?? '', line1: '', line2: '', city: '', state: '', zip: '', country: 'United States', phone: '', isDefault: false })

  const saveAddress = async () => {
    if (!user) return
    if (!form.fullName || !form.line1 || !form.city || !form.state || !form.zip) {
      toast('Please fill in all required fields', 'error')
      return
    }
    const addr = createDemoAddress(form)
    await api.updateProfile(user.id, { addresses: [...user.addresses, addr] })
    await refreshSession()
    setEditing(false)
    toast('Address added')
  }

  const remove = async (id: string) => {
    if (!user) return
    await api.updateProfile(user.id, { addresses: user.addresses.filter((a) => a.id !== id) })
    await refreshSession()
    toast('Address removed', 'info')
  }

  if (user?.addresses.length === 0 && !editing) {
    return (
      <EmptyState
        icon={MapPin}
        title="No saved addresses"
        message="Save your shipping address for faster checkout."
        action={() => setEditing(true)}
        actionLabel="Add address"
      />
    )
  }

  return (
    <div>
      <TabHeader title="Addresses" count={user?.addresses.length} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {user?.addresses.map((a) => (
          <div key={a.id} className="border border-volt-line p-5">
            <div className="flex items-start justify-between">
              <p className="font-semibold">{a.fullName}</p>
              <button type="button" onClick={() => remove(a.id)} aria-label="Remove address" className="text-volt-graphite/50 hover:text-volt-orange-dark">
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-volt-graphite/80">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
            <p className="text-sm text-volt-graphite/80">{a.city}, {a.state} {a.zip}</p>
            <p className="text-sm text-volt-graphite/80">{a.country}</p>
            {a.isDefault && <span className="mt-2 inline-block bg-volt-black px-2 py-0.5 text-[10px] font-bold uppercase text-white">Default</span>}
          </div>
        ))}
        {editing && (
          <div className="border border-dashed border-volt-line p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.1em]">New address</p>
            <div className="mt-3 space-y-3">
              <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} aria-label="Full name" />
              <Input placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} aria-label="Street address" />
              <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} aria-label="City" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} aria-label="State" />
                <Input placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} aria-label="ZIP" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveAddress}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {!editing && (
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(true)}>
          <Plus className="size-4" /> Add address
        </Button>
      )}
    </div>
  )
}

export function PaymentsTab() {
  const { user, toast, refreshSession } = useStore()
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState<'card' | 'upi'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [upiId, setUpiId] = useState('')

  const save = async () => {
    if (!user) return
    if (type === 'card' && cardNumber.replace(/\s/g, '').length < 15) {
      toast('Enter a valid card number', 'error')
      return
    }
    if (type === 'upi' && !/@/.test(upiId)) {
      toast('Enter a valid UPI ID', 'error')
      return
    }
    const pm: PaymentMethod =
      type === 'card'
        ? createDemoPayment({ type: 'card', label: `Card ending ${cardNumber.slice(-4)}`, last4: cardNumber.slice(-4) })
        : createDemoPayment({ type: 'upi', label: upiId, upiId })
    await api.updateProfile(user.id, { paymentMethods: [...user.paymentMethods, pm] })
    await refreshSession()
    setAdding(false)
    setCardNumber('')
    setUpiId('')
    toast('Payment method saved')
  }

  const remove = async (id: string) => {
    if (!user) return
    await api.updateProfile(user.id, { paymentMethods: user.paymentMethods.filter((p) => p.id !== id) })
    await refreshSession()
    toast('Payment method removed', 'info')
  }

  return (
    <div>
      <TabHeader title="Payment methods" count={user?.paymentMethods.length} />
      <p className="mt-2 text-xs text-volt-graphite/60">Stored for demo purposes only — no real card data is kept.</p>
      <ul className="mt-6 space-y-3">
        {user?.paymentMethods.map((p) => (
          <li key={p.id} className="flex items-center justify-between border border-volt-line p-4">
            <span className="flex items-center gap-3 text-sm font-medium">
              <CreditCard className="size-4 text-volt-graphite/60" />
              {p.type === 'card' ? <>Card •••• {p.last4}</> : <>{p.upiId}</>}
            </span>
            <button type="button" onClick={() => remove(p.id)} aria-label="Remove payment method" className="text-volt-graphite/50 hover:text-volt-orange-dark">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="mt-4 max-w-md space-y-3 border border-dashed border-volt-line p-5">
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('card')} className={`px-3 py-1.5 text-xs font-semibold ${type === 'card' ? 'bg-volt-black text-white' : 'border border-volt-line'}`}>Card</button>
            <button type="button" onClick={() => setType('upi')} className={`px-3 py-1.5 text-xs font-semibold ${type === 'upi' ? 'bg-volt-black text-white' : 'border border-volt-line'}`}>UPI</button>
          </div>
          {type === 'card' ? (
            <Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} aria-label="Card number" className="font-mono" />
          ) : (
            <Input placeholder="name@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} aria-label="UPI ID" className="font-mono" />
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add payment method
        </Button>
      )}
    </div>
  )
}

export function SettingsTab() {
  const { user, signOut } = useStore()
  return (
    <div>
      <TabHeader title="Settings" />
      <div className="mt-6 max-w-md space-y-4 text-sm">
        <div className="flex items-center justify-between border border-volt-line p-4">
          <div>
            <p className="font-semibold">Email notifications</p>
            <p className="text-xs text-volt-graphite/60">Drops, restocks and order updates.</p>
          </div>
          <span className="bg-volt-black px-2 py-1 text-[10px] font-bold uppercase text-white">On</span>
        </div>
        <div className="flex items-center justify-between border border-volt-line p-4">
          <div>
            <p className="font-semibold">Sign-in provider</p>
            <p className="text-xs text-volt-graphite/60">{user?.provider} account</p>
          </div>
        </div>
        <Button variant="outline" onClick={signOut}>Sign out of VOLTERRA</Button>
      </div>
    </div>
  )
}
