import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { cartTotals } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSEO } from '@/lib/seo'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export default function Cart() {
  useSEO('Shopping Bag', 'Review your VOLTERRA shopping bag and checkout securely.')
  const { cart, saved, updateCartQuantity, removeFromCart, moveToSaved, moveToCart, removeSaved, toast, clearCart } = useStore()
  const navigate = useNavigate()
  const totals = cartTotals(cart)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal)
  const progress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  if (cart.length === 0 && saved.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="You haven't added anything yet. Explore the latest drops and find your next essential."
          action={() => navigate('/shop')}
          actionLabel="Start shopping"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <h1 className="display text-4xl text-volt-black sm:text-6xl">Your Bag</h1>
      <p className="mt-3 text-sm text-volt-graphite/70">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          {cart.length > 0 && (
            <>
              <div className="mb-8">
                <p className="text-xs text-volt-graphite/70">
                  {remaining > 0 ? (
                    <>You're <strong>{formatPrice(remaining)}</strong> away from free shipping.</>
                  ) : (
                    <strong className="text-volt-orange-dark">You've unlocked free shipping!</strong>
                  )}
                </p>
                <div className="mt-2 h-1 w-full bg-volt-mist" role="presentation">
                  <div className="h-full bg-volt-orange transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <ul className="divide-y divide-volt-line border-t border-volt-line">
                {cart.map((item) => (
                  <li key={item.id} className="flex gap-4 py-6 sm:gap-6">
                    <Link to={`/product/${item.slug}`} className="block w-24 shrink-0 bg-volt-mist sm:w-32">
                      <img src={item.image} alt={item.name} className="aspect-[4/5] w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/product/${item.slug}`} className="font-display text-base font-bold uppercase tracking-[0.02em] hover:text-volt-orange">
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-volt-graphite/70">{item.color} · {item.size}</p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        <div className="flex items-center border border-volt-line">
                          <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} className="flex size-9 items-center justify-center hover:bg-volt-mist">
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} className="flex size-9 items-center justify-center hover:bg-volt-mist">
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <button type="button" onClick={() => { moveToSaved(item.id); toast(`${item.name} saved for later`, 'info') }} className="font-medium text-volt-graphite/70 underline-offset-4 hover:underline">
                            Save for later
                          </button>
                          <button type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="flex items-center gap-1 font-medium text-volt-graphite/70 underline-offset-4 hover:text-volt-orange-dark hover:underline">
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => { clearCart(); toast('Bag cleared', 'info') }} className="mt-4 text-xs text-volt-graphite/60 underline-offset-4 hover:underline">
                Clear bag
              </button>
            </>
          )}

          {saved.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em]">Saved for later ({saved.length})</h2>
              <ul className="mt-4 divide-y divide-volt-line border-t border-volt-line">
                {saved.map((item) => (
                  <li key={item.id} className="flex gap-4 py-5">
                    <Link to={`/product/${item.slug}`} className="block w-16 shrink-0 bg-volt-mist sm:w-20">
                      <img src={item.image} alt={item.name} className="aspect-[4/5] w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col justify-center">
                      <Link to={`/product/${item.slug}`} className="text-sm font-semibold hover:underline">{item.name}</Link>
                      <p className="mt-0.5 text-xs text-volt-graphite/60">{item.color} · {item.size} · {formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <button type="button" onClick={() => moveToCart(item.id)} className="font-semibold text-volt-black underline-offset-4 hover:underline">
                        Move to bag
                      </button>
                      <button type="button" onClick={() => removeSaved(item.id)} aria-label={`Remove ${item.name} from saved`} className="text-volt-graphite/60 hover:text-volt-orange-dark">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="h-fit border border-volt-line bg-volt-smoke/60 p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-bold uppercase tracking-[0.1em]">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Discount</dt>
              <dd className="font-semibold text-volt-orange-dark">{totals.discount > 0 ? `−${formatPrice(totals.discount)}` : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Shipping</dt>
              <dd className="font-semibold">{totals.shipping === 0 ? <span className="text-volt-orange-dark">Free</span> : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-volt-graphite/80">Estimated tax</dt>
              <dd className="font-semibold">{formatPrice(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-volt-line pt-4 text-base">
              <dt className="font-display font-bold uppercase tracking-[0.08em]">Total</dt>
              <dd className="font-display text-xl font-bold">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <Button fullWidth size="xl" className="mt-6" onClick={() => navigate('/checkout')} disabled={cart.length === 0}>
            Checkout <ArrowRight className="size-4" />
          </Button>
          <p className="mt-4 text-center text-xs text-volt-graphite/60">Secure checkout · Mock payment in demo mode</p>
          <Link to="/shop" className="mt-4 block text-center text-xs font-semibold text-volt-graphite underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
