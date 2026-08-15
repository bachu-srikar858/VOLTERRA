import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lock, PackageCheck } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api, cartTotals } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useSEO } from '@/lib/seo'
import { StepInformation, StepShipping, StepDelivery, StepPayment, emptyCheckoutData, type CheckoutData } from '@/components/checkout/CheckoutSteps'
import type { Address, Order } from '@/lib/types'
import { cn } from '@/lib/utils'

const STEPS = ['Information', 'Shipping', 'Delivery', 'Payment']

export default function Checkout() {
  useSEO('Checkout', 'Complete your VOLTERRA order securely. Demo checkout — no real payment processed.')
  const { cart, user, clearCart, toast } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<CheckoutData>(() => ({
    ...emptyCheckoutData,
    email: user?.email ?? '',
    address: {
      ...emptyCheckoutData.address,
      fullName: user?.name ?? '',
    },
  }))
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cart.length === 0 && !placedOrder) {
      navigate('/shop', { replace: true })
    }
  }, [cart.length, placedOrder, navigate])

  const totals = useMemo(() => {
    const base = cartTotals(cart)
    const express = data.delivery === 'express'
    const shipping = express ? 15 : base.shipping
    const total = base.subtotal + shipping + base.tax
    return { ...base, shipping, total }
  }, [cart, data.delivery])

  const validate = (s: number): string => {
    if (s === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Please enter a valid email address.'
    }
    if (s === 2) {
      const a = data.address
      if (!a.fullName || !a.line1 || !a.city || !a.state || !a.zip || !a.phone) return 'Please complete all required shipping fields.'
      if (!a.phone.replace(/\D/g, '').length) return 'Please enter a valid phone number.'
    }
    if (s === 4) {
      if (data.paymentMethod === 'card') {
        if (data.cardNumber.replace(/\s/g, '').length < 15) return 'Please enter a valid card number.'
        if (!data.cardName.trim()) return 'Please enter the name on the card.'
        if (!/^\d{2}\/\d{2}$/.test(data.cardExpiry)) return 'Please enter a valid expiry (MM/YY).'
        if (data.cardCvc.length < 3) return 'Please enter a valid CVC.'
      }
      if (data.paymentMethod === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(data.upiId)) {
        return 'Please enter a valid UPI ID (e.g. name@bank).'
      }
    }
    return ''
  }

  const next = () => {
    const err = validate(step)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep((s) => s + 1)
    window.scrollTo({ top: 0 })
  }

  const back = () => {
    setError('')
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0 })
  }

  const placeOrder = async () => {
    const err = validate(4)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setPlacing(true)
    try {
      const address: Address = { ...data.address, id: `addr-${Date.now()}` }
      const order = await api.createOrder({
        email: data.email,
        userId: user?.id ?? null,
        items: cart.map((it) => ({
          productId: it.productId,
          name: it.name,
          image: it.image,
          price: it.price,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
        })),
        subtotal: totals.subtotal,
        discount: 0,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        paymentMethod: data.paymentMethod,
        shippingAddress: address,
      })
      setPlacedOrder(order)
      clearCart()
      toast('Order placed successfully')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError('We couldn\'t place your order. Please try again.')
      console.error(e)
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 text-center sm:px-6">
        <div className="mx-auto flex size-20 items-center justify-center bg-volt-black text-white">
          <PackageCheck className="size-9" />
        </div>
        <h1 className="display mt-8 text-4xl sm:text-5xl">Order confirmed</h1>
        <p className="mt-4 text-sm leading-relaxed text-volt-graphite/80">
          Thanks {data.address.fullName.split(' ')[0] || 'athlete'} — your order is in. A confirmation has been sent to{' '}
          <strong>{data.email}</strong>.
        </p>
        <p className="mt-2 font-mono text-sm text-volt-graphite/70">Order #{placedOrder.id}</p>

        <div className="mt-8 border border-volt-line text-left">
          <ul className="divide-y divide-volt-line">
            {placedOrder.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 p-4">
                <img src={it.image} alt={it.name} className="w-14 bg-volt-mist object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-volt-graphite/60">{it.color} · {it.size} · Qty {it.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-volt-line bg-volt-smoke/60 px-4 py-4">
            <span className="font-display text-sm font-bold uppercase tracking-[0.08em]">Total</span>
            <span className="font-display text-xl font-bold">{formatPrice(placedOrder.total)}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-volt-graphite/60">Estimated delivery {data.delivery === 'express' ? '2–3 business days' : '5–7 business days'}.</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate('/shop')}>Continue shopping</Button>
          {user ? (
            <Button size="lg" variant="outline" onClick={() => navigate('/account')}>View my orders</Button>
          ) : (
            <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>Create an account to track</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl sm:text-4xl">Checkout</h1>
        <Link to="/cart" className="hidden items-center gap-1.5 text-xs font-medium text-volt-graphite underline-offset-4 hover:underline sm:flex">
          <ArrowLeft className="size-3.5" /> Back to bag
        </Link>
      </div>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-0 border-y border-volt-line py-0" aria-label="Checkout progress">
        {STEPS.map((label, i) => {
          const n = i + 1
          const active = step === n
          const done = step > n
          return (
            <li key={label} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => n < step && setStep(n)}
                disabled={n >= step}
                className={cn(
                  'flex items-center gap-2.5 py-4 text-left transition-colors',
                  active ? 'text-volt-black' : done ? 'text-volt-orange-dark cursor-pointer' : 'text-volt-graphite/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center border text-[11px] font-bold transition-colors',
                    done ? 'border-volt-orange bg-volt-orange text-white' : active ? 'border-volt-black bg-volt-black text-white' : 'border-current',
                  )}
                >
                  {done ? <Check className="size-3.5" /> : n}
                </span>
                <span className="hidden font-display text-xs font-bold uppercase tracking-[0.1em] sm:block">{label}</span>
              </button>
              {n < STEPS.length && <span className={cn('mx-3 h-px flex-1', step > n ? 'bg-volt-orange' : 'bg-volt-line')} aria-hidden />}
            </li>
          )
        })}
      </ol>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div>
          {step === 1 && <StepInformation data={data} onChange={setData} />}
          {step === 2 && <StepShipping data={data} onChange={setData} savedAddress={user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0] ?? null} />}
          {step === 3 && <StepDelivery data={data} onChange={setData} />}
          {step === 4 && <StepPayment data={data} onChange={setData} />}

          {error && (
            <p role="alert" className="mt-6 border border-volt-orange/40 bg-volt-orange-soft px-4 py-3 text-sm font-medium text-volt-orange-dark">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="size-4" /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <Button onClick={next}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="orange" size="xl" onClick={placeOrder} loading={placing}>
                <Lock className="size-4" /> Place order · {formatPrice(totals.total)}
              </Button>
            )}
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-volt-graphite/60">
            <Lock className="size-3.5" /> This is a demo checkout. No real payment is processed.
          </p>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-volt-line p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-bold uppercase tracking-[0.1em]">Order summary</h2>
          <ul className="mt-5 space-y-4 border-b border-volt-line pb-5">
            {cart.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={it.image} alt={it.name} className="w-12 bg-volt-mist object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-4.5 items-center justify-center bg-volt-black text-[9px] font-bold text-white">
                    {it.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{it.name}</p>
                  <p className="text-[11px] text-volt-graphite/60">{it.size} · {it.color}</p>
                </div>
                <p className="text-xs font-semibold">{formatPrice(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Shipping</dt>
              <dd className="font-semibold">{totals.shipping === 0 ? <span className="text-volt-orange-dark">Free</span> : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Estimated tax</dt>
              <dd className="font-semibold">{formatPrice(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-volt-line pt-3 text-base">
              <dt className="font-display font-bold uppercase tracking-[0.08em]">Total</dt>
              <dd className="font-display text-lg font-bold">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
