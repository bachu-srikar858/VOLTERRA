import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { Drawer } from '@/components/ui/Modal'
import { formatPrice } from '@/lib/utils'
import { cartTotals } from '@/lib/api'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateCartQuantity, removeFromCart, moveToSaved, toast } = useStore()
  const navigate = useNavigate()
  const totals = cartTotals(cart)
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal)

  return (
    <Drawer open={cartOpen} onClose={() => setCartOpen(false)} side="right" title="Shopping bag">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-volt-line px-5 py-4">
          <h2 className="font-display text-base font-bold uppercase tracking-[0.1em]">
            Bag ({cart.reduce((s, it) => s + it.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            className="flex size-9 items-center justify-center transition-colors hover:bg-volt-mist"
          >
            <X className="size-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="size-10 text-volt-graphite/30" strokeWidth={1.2} />
            <p className="mt-4 font-display text-lg font-bold uppercase">Your bag is empty</p>
            <p className="mt-1 text-sm text-volt-graphite/70">Find your next gear and get moving.</p>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false)
                navigate('/shop')
              }}
              className="mt-6 bg-volt-black px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-volt-orange"
            >
              Shop now
            </button>
          </div>
        ) : (
          <>
            {remaining > 0 && (
              <p className="border-b border-volt-line bg-volt-smoke px-5 py-3 text-xs text-volt-graphite">
                Add <strong>{formatPrice(remaining)}</strong> more for free shipping.
              </p>
            )}
            <ul className="flex-1 divide-y divide-volt-line overflow-y-auto px-5">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="block w-20 shrink-0 bg-volt-mist"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="text-sm font-semibold text-volt-black hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-volt-graphite/70">
                          {item.color} · {item.size}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-volt-line">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex size-7 items-center justify-center transition-colors hover:bg-volt-mist"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex size-7 items-center justify-center transition-colors hover:bg-volt-mist"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            moveToSaved(item.id)
                            toast(`${item.name} saved for later`, 'info')
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-volt-graphite/70 hover:text-volt-black"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from bag`}
                          className="flex size-7 items-center justify-center text-volt-graphite/60 transition-colors hover:text-volt-orange-dark"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-volt-line px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-volt-graphite">Subtotal</span>
                <span className="font-display text-lg font-bold">{formatPrice(totals.subtotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false)
                  navigate('/checkout')
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 bg-volt-black py-4 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-volt-orange"
              >
                Checkout <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false)
                  navigate('/cart')
                }}
                className="mt-2 w-full py-3 text-center text-xs font-medium text-volt-graphite underline-offset-4 hover:underline"
              >
                View full bag
              </button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}
