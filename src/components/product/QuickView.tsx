import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/context/StoreContext'
import { Price } from '@/components/ui/Price'
import { Rating } from '@/components/ui/Rating'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product | null
  open: boolean
  onClose: () => void
}) {
  const { addToCart, toggleWishlist, isWishlisted, toast } = useStore()
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (product) {
      setSize('')
      setColor(product.colors[0]?.name ?? '')
      setActiveImg(0)
    }
  }, [product])

  const totalStock = useMemo(
    () => (product ? product.sizes.reduce((s, sz) => s + sz.stock, 0) : 0),
    [product],
  )
  if (!product) return null
  const wished = isWishlisted(product.id)
  const selectedSize = product.sizes.find((s) => s.size === size)
  const outOfStock = selectedSize ? selectedSize.stock === 0 : false

  const handleAdd = () => {
    if (!size) {
      toast('Please select a size', 'error')
      return
    }
    if (outOfStock) {
      toast('This size is out of stock', 'error')
      return
    }
    addToCart(product, size, color || product.colors[0]?.name || 'One', 1)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={product.name} panelClassName="max-w-4xl">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="bg-volt-mist">
          <img
            src={product.images[activeImg] ?? product.images[0]}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    'size-14 overflow-hidden border-2 bg-white transition-colors',
                    activeImg === i ? 'border-volt-orange' : 'border-transparent',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <p className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-graphite/60">
            {product.categoryName}
          </p>
          <h3 className="display mt-1 text-2xl">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <Rating value={product.rating} showValue />
            <span className="text-xs text-volt-graphite/60">{product.reviewCount} reviews</span>
          </div>
          <div className="mt-3">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-volt-graphite/80">
            {product.description}
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold uppercase tracking-[0.12em]">Color</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={`Select color ${c.name}`}
                  aria-pressed={color === c.name}
                  className={cn(
                    'flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition-colors',
                    color === c.name ? 'border-volt-black bg-volt-black text-white' : 'border-volt-line hover:border-volt-graphite',
                  )}
                >
                  <span className="size-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold uppercase tracking-[0.12em]">Size</span>
              <span className="text-xs text-volt-graphite/60">Size guide on product page</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => setSize(s.size)}
                  disabled={s.stock === 0}
                  aria-pressed={size === s.size}
                  className={cn(
                    'border py-2 text-xs font-semibold transition-colors',
                    s.stock === 0
                      ? 'cursor-not-allowed border-volt-line text-volt-graphite/30 line-through'
                      : size === s.size
                        ? 'border-volt-orange bg-volt-orange text-white'
                        : 'border-volt-line hover:border-volt-black',
                  )}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleAdd} className="flex-1" disabled={totalStock === 0}>
              Add to bag
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
              className={cn(wished && 'bg-volt-orange text-white border-volt-orange hover:bg-volt-orange-dark hover:text-white')}
            >
              <Heart className={cn('size-4', wished && 'fill-current')} />
            </Button>
          </div>
          {totalStock === 0 && (
            <p className="mt-3 text-center text-sm font-medium text-volt-orange-dark">Out of stock</p>
          )}

          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="mt-5 text-center text-xs font-semibold text-volt-graphite underline-offset-4 hover:underline"
          >
            View full product details
          </Link>
        </div>
      </div>
    </Modal>
  )
}
