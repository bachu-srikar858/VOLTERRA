import { useState } from 'react'
import { Banknote, CreditCard, Landmark, Zap } from 'lucide-react'
import { Field, Input } from '@/components/ui/Field'
import type { Address, PaymentMethodType } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface CheckoutData {
  email: string
  address: Address
  delivery: 'standard' | 'express'
  paymentMethod: PaymentMethodType
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvc: string
  upiId: string
}

export const emptyAddress: Address = {
  id: '',
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  phone: '',
  isDefault: false,
}

export const emptyCheckoutData: CheckoutData = {
  email: '',
  address: emptyAddress,
  delivery: 'standard',
  paymentMethod: 'card',
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvc: '',
  upiId: '',
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function StepInformation({ data, onChange }: { data: CheckoutData; onChange: (d: CheckoutData) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.06em]">Contact</h2>
      <Field label="Email address" id="co-email">
        <Input
          id="co-email"
          type="email"
          autoComplete="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="you@example.com"
        />
      </Field>
      <p className="text-xs text-volt-graphite/60">Order updates and receipts will be sent here. You'll need a valid email to track your order.</p>
    </div>
  )
}

export function StepShipping({ data, onChange, savedAddress }: { data: CheckoutData; onChange: (d: CheckoutData) => void; savedAddress?: Address | null }) {
  const [useSaved, setUseSaved] = useState(Boolean(savedAddress))
  const a = data.address
  const set = (patch: Partial<Address>) => onChange({ ...data, address: { ...a, ...patch } })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.06em]">Shipping address</h2>
        {savedAddress && (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
            <input type="checkbox" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} className="size-4 accent-volt-black" />
            Use saved address
          </label>
        )}
      </div>

      {useSaved && savedAddress ? (
        <div className="border border-volt-line bg-volt-smoke/60 p-5 text-sm">
          <p className="font-semibold">{savedAddress.fullName}</p>
          <p className="mt-1 text-volt-graphite/80">{savedAddress.line1}{savedAddress.line2 ? `, ${savedAddress.line2}` : ''}</p>
          <p className="text-volt-graphite/80">{savedAddress.city}, {savedAddress.state} {savedAddress.zip}</p>
          <p className="text-volt-graphite/80">{savedAddress.country} · {savedAddress.phone}</p>
          <button type="button" onClick={() => setUseSaved(false)} className="mt-3 text-xs font-semibold underline-offset-4 hover:underline">
            Edit address
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="addr-name" className="sm:col-span-2">
            <Input id="addr-name" autoComplete="name" value={a.fullName} onChange={(e) => set({ fullName: e.target.value })} placeholder="Jordan Smith" />
          </Field>
          <Field label="Address line 1" id="addr-line1" className="sm:col-span-2">
            <Input id="addr-line1" autoComplete="address-line1" value={a.line1} onChange={(e) => set({ line1: e.target.value })} placeholder="123 Runner Street" />
          </Field>
          <Field label="Address line 2 (optional)" id="addr-line2" className="sm:col-span-2">
            <Input id="addr-line2" autoComplete="address-line2" value={a.line2 ?? ''} onChange={(e) => set({ line2: e.target.value })} placeholder="Apt, suite, floor" />
          </Field>
          <Field label="City" id="addr-city">
            <Input id="addr-city" autoComplete="address-level2" value={a.city} onChange={(e) => set({ city: e.target.value })} placeholder="Portland" />
          </Field>
          <Field label="State" id="addr-state">
            <Input id="addr-state" autoComplete="address-level1" value={a.state} onChange={(e) => set({ state: e.target.value })} placeholder="OR" />
          </Field>
          <Field label="ZIP / Postal code" id="addr-zip">
            <Input id="addr-zip" autoComplete="postal-code" value={a.zip} onChange={(e) => set({ zip: e.target.value })} placeholder="97201" />
          </Field>
          <Field label="Phone" id="addr-phone">
            <Input id="addr-phone" type="tel" autoComplete="tel" value={a.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="555-0100" />
          </Field>
        </div>
      )}
    </div>
  )
}

export function StepDelivery({ data, onChange }: { data: CheckoutData; onChange: (d: CheckoutData) => void }) {
  const options = [
    { id: 'standard' as const, label: 'Standard', eta: '5–7 business days', price: 0, note: 'Free over $150' },
    { id: 'express' as const, label: 'Express', eta: '2–3 business days', price: 15, note: 'Priority handling' },
  ]
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.06em]">Delivery method</h2>
      <div className="space-y-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange({ ...data, delivery: o.id })}
            aria-pressed={data.delivery === o.id}
            className={cn(
              'flex w-full items-center justify-between gap-4 border p-5 text-left transition-colors',
              data.delivery === o.id ? 'border-volt-black bg-volt-black text-white' : 'border-volt-line hover:border-volt-graphite',
            )}
          >
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.08em]">{o.label}</p>
              <p className={cn('mt-0.5 text-xs', data.delivery === o.id ? 'text-white/60' : 'text-volt-graphite/60')}>{o.eta} · {o.note}</p>
            </div>
            <p className="font-display text-sm font-bold">{o.price === 0 ? 'FREE' : `$${o.price}`}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export function StepPayment({ data, onChange }: { data: CheckoutData; onChange: (d: CheckoutData) => void }) {
  const methods: { id: PaymentMethodType; label: string; icon: typeof CreditCard; hint: string }[] = [
    { id: 'card', label: 'Card', icon: CreditCard, hint: 'Visa, Mastercard, Amex' },
    { id: 'upi', label: 'UPI', icon: Landmark, hint: 'Google Pay, PhonePe, Paytm' },
    { id: 'cod', label: 'Cash on delivery', icon: Banknote, hint: 'Pay when your order arrives' },
  ]
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.06em]">Payment</h2>
      <div className="grid grid-cols-3 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange({ ...data, paymentMethod: m.id })}
            aria-pressed={data.paymentMethod === m.id}
            className={cn(
              'flex flex-col items-center gap-2 border p-4 text-center transition-colors',
              data.paymentMethod === m.id ? 'border-volt-black bg-volt-black text-white' : 'border-volt-line hover:border-volt-graphite',
            )}
          >
            <m.icon className="size-5" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em]">{m.label}</span>
            <span className={cn('text-[10px] leading-tight', data.paymentMethod === m.id ? 'text-white/60' : 'text-volt-graphite/60')}>{m.hint}</span>
          </button>
        ))}
      </div>

      {data.paymentMethod === 'card' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Card number" id="pay-card" className="sm:col-span-2">
            <Input
              id="pay-card"
              inputMode="numeric"
              autoComplete="cc-number"
              value={data.cardNumber}
              onChange={(e) => onChange({ ...data, cardNumber: formatCardNumber(e.target.value) })}
              placeholder="4242 4242 4242 4242"
              className="font-mono"
            />
          </Field>
          <Field label="Name on card" id="pay-name" className="sm:col-span-2">
            <Input id="pay-name" autoComplete="cc-name" value={data.cardName} onChange={(e) => onChange({ ...data, cardName: e.target.value })} placeholder="Jordan Smith" />
          </Field>
          <Field label="Expiry" id="pay-exp">
            <Input id="pay-exp" inputMode="numeric" autoComplete="cc-exp" value={data.cardExpiry} onChange={(e) => onChange({ ...data, cardExpiry: formatExpiry(e.target.value) })} placeholder="MM/YY" className="font-mono" />
          </Field>
          <Field label="CVC" id="pay-cvc">
            <Input id="pay-cvc" inputMode="numeric" autoComplete="cc-csc" value={data.cardCvc} onChange={(e) => onChange({ ...data, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" className="font-mono" />
          </Field>
        </div>
      )}

      {data.paymentMethod === 'upi' && (
        <Field label="UPI ID" id="pay-upi" hint="Test mode: any valid UPI format is accepted.">
          <Input id="pay-upi" value={data.upiId} onChange={(e) => onChange({ ...data, upiId: e.target.value })} placeholder="yourname@bank" className="font-mono" />
        </Field>
      )}

      {data.paymentMethod === 'cod' && (
        <div className="flex items-start gap-3 border border-volt-line bg-volt-smoke/60 p-4 text-sm text-volt-graphite/80">
          <Banknote className="mt-0.5 size-5 shrink-0 text-volt-orange" />
          <p>Pay in cash when your order is delivered. A confirmation call may be required for orders over $200.</p>
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-volt-graphite/60">
        <Zap className="size-3.5 text-volt-orange" />
        Demo checkout — no real payment is processed. No card will be charged.
      </p>
    </div>
  )
}
