import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Heart, Minus, Plus, RefreshCcw, Ruler, ShieldCheck, ShoppingBag, Truck, X, Zap } from 'lucide-react'
import AnimatedContent from '@/components/ReactBits/AnimatedContent'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton, TextSkeleton } from '@/components/ui/Skeleton'
import { Rating } from '@/components/ui/Rating'
import { Price } from '@/components/ui/Price'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PackageX } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { api, getRelatedProducts } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import type { Product, Review } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted, toast, setCartOpen } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<'details' | 'reviews'>('details')
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setActiveImg(0)
    setSize('')
    setColor('')
    setQuantity(1)
    ;(async () => {
      const p = await api.getProductBySlug(id ?? '')
      if (cancelled) return
      if (!p) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setProduct(p)
      setColor(p.colors[0]?.name ?? '')
      const [revs, rel] = await Promise.all([api.getReviews(p.id), getRelatedProducts(p, 4)])
      if (!cancelled) {
        setReviews(revs)
        setRelated(rel)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useSEO(product ? product.name : undefined, product ? `${product.name} — ${product.description.slice(0, 150)}` : undefined)

  const totalStock = useMemo(() => (product ? product.sizes.reduce((s, sz) => s + sz.stock, 0) : 0), [product])
  const selectedSizeStock = product?.sizes.find((s) => s.size === size)?.stock ?? 0

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-24 sm:px-6 lg:px-10 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-2">
          <TextSkeleton lines={1} />
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="skeleton aspect-[4/5] w-full" />
          <div className="space-y-4">
            <TextSkeleton lines={2} />
            <TextSkeleton lines={4} />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32">
        <EmptyState
          icon={PackageX}
          title="Product unavailable"
          message="The product you're looking for doesn't exist or has been removed. Browse the full collection instead."
          action={() => navigate('/shop')}
          actionLabel="Back to shop"
        />
      </div>
    )
  }

  const wished = isWishlisted(product.id)
  const inStock = totalStock > 0

  const handleAdd = (buyNow = false) => {
    if (!size) {
      toast('Please select a size', 'error')
      return
    }
    if (selectedSizeStock === 0) {
      toast('This size is out of stock', 'error')
      return
    }
    addToCart(product, size, color, quantity)
    if (buyNow) {
      setCartOpen(false)
      navigate('/checkout')
    } else {
      setCartOpen(true)
    }
  }

  const reviewAvg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-24 sm:px-6 lg:px-10 lg:pt-28">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-volt-graphite/70">
          <Link to="/" className="hover:text-volt-black">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/shop" className="hover:text-volt-black">Shop</Link>
          <ChevronRight className="size-3" />
          <Link to={`/shop?category=${product.categoryName.toLowerCase()}`} className="hover:text-volt-black">{product.categoryName}</Link>
          <ChevronRight className="size-3" />
          <span className="text-volt-black">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden bg-volt-mist">
              <img
                key={activeImg}
                src={product.images[activeImg] ?? product.images[0]}
                alt={`${product.name} — view ${activeImg + 1}`}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                {product.compareAtPrice != null && product.compareAtPrice > product.price && <Badge tone="orange">Sale</Badge>}
                {product.isNew && <Badge tone="black">New</Badge>}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1} of ${product.images.length}`}
                    aria-current={activeImg === i}
                    className={cn(
                      'w-20 overflow-hidden border-2 bg-volt-mist transition-colors',
                      activeImg === i ? 'border-volt-orange' : 'border-transparent hover:border-volt-line',
                    )}
                  >
                    <img src={img} alt="" className="aspect-[4/5] w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy panel */}
          <div className="lg:max-w-lg">
            <p className="text-xs font-display font-bold uppercase tracking-[0.16em] text-volt-graphite/60">
              {product.categoryName} · {product.gender}
            </p>
            <h1 className="display mt-2 text-4xl text-volt-black sm:text-5xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <Rating value={reviewAvg} showValue />
              <button type="button" onClick={() => setTab('reviews')} className="text-xs text-volt-graphite/70 underline-offset-4 hover:underline">
                {reviews.length || product.reviewCount} reviews
              </button>
            </div>

            <div className="mt-4">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            </div>

            {totalStock > 0 && totalStock <= 10 && (
              <p className="mt-2 text-xs font-semibold text-volt-orange-dark">Hurry — only {totalStock} left in stock</p>
            )}

            <p className="mt-5 text-sm leading-relaxed text-volt-graphite/80">{product.description}</p>

            {/* Color */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-display font-bold uppercase tracking-[0.12em]">Color: <span className="font-sans font-semibold normal-case tracking-normal">{color}</span></p>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    aria-label={`Select color ${c.name}`}
                    aria-pressed={color === c.name}
                    title={c.name}
                    className={cn(
                      'flex items-center gap-2 border px-3 py-2 text-xs font-medium transition-colors',
                      color === c.name ? 'border-volt-black bg-volt-black text-white' : 'border-volt-line hover:border-volt-graphite',
                    )}
                  >
                    <span className="size-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-display font-bold uppercase tracking-[0.12em]">Size</p>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="flex items-center gap-1 text-xs font-medium text-volt-graphite underline-offset-4 hover:underline"
                >
                  <Ruler className="size-3.5" /> Size guide
                </button>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSize(s.size)}
                    disabled={s.stock === 0}
                    aria-pressed={size === s.size}
                    className={cn(
                      'border py-3 text-xs font-semibold transition-colors',
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
              {size && (
                <p className="mt-2 text-xs text-volt-graphite/70">
                  {selectedSizeStock === 0 ? 'This size is out of stock.' : `${selectedSizeStock} available in this size.`}
                </p>
              )}
            </div>

            {/* Quantity + actions */}
            <div className="mt-7 flex items-center gap-4">
              <div className="flex items-center border border-volt-line">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="flex size-11 items-center justify-center transition-colors hover:bg-volt-mist">
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="flex size-11 items-center justify-center transition-colors hover:bg-volt-mist">
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-pressed={wished}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                className={cn(
                  'flex size-11 items-center justify-center border transition-colors',
                  wished ? 'border-volt-orange bg-volt-orange text-white' : 'border-volt-line text-volt-black hover:border-volt-black',
                )}
              >
                <Heart className={cn('size-5', wished && 'fill-current')} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button size="xl" fullWidth className="sm:flex-1" onClick={() => handleAdd(false)} disabled={!inStock} loading={false}>
                <ShoppingBag className="size-4" /> Add to bag
              </Button>
              <Button size="xl" variant="orange" fullWidth className="sm:flex-1" onClick={() => handleAdd(true)} disabled={!inStock}>
                <Zap className="size-4" /> Buy now
              </Button>
            </div>

            {!inStock && (
              <p className="mt-3 rounded-sm bg-volt-orange-soft px-4 py-3 text-center text-sm font-semibold text-volt-orange-dark">
                Out of stock — check back soon
              </p>
            )}

            <ul className="mt-7 space-y-2.5 border-t border-volt-line pt-6 text-xs text-volt-graphite/70">
              <li className="flex items-center gap-2.5"><Truck className="size-4 text-volt-orange" /> Free shipping on orders over $150</li>
              <li className="flex items-center gap-2.5"><RefreshCcw className="size-4 text-volt-orange" /> 30-day free returns</li>
              <li className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-volt-orange" /> 2-year VOLTERRA performance warranty</li>
              <li className="flex items-center gap-2.5">SKU: <span className="font-mono text-volt-graphite">{product.sku}</span></li>
            </ul>
          </div>
        </div>

        {/* Tabs: details / reviews */}
        <div className="mt-20 border-t border-volt-line">
          <div className="flex gap-8 border-b border-volt-line" role="tablist" aria-label="Product information">
            {(
              [
                { id: 'details', label: 'Product Details' },
                { id: 'reviews', label: `Reviews (${reviews.length || product.reviewCount})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative py-4 font-display text-sm font-bold uppercase tracking-[0.1em] transition-colors',
                  tab === t.id ? 'text-volt-black' : 'text-volt-graphite/60 hover:text-volt-black',
                )}
              >
                {t.label}
                {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-volt-orange" aria-hidden />}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Materials</h3>
                <p className="mt-3 text-sm leading-relaxed text-volt-graphite/80">{product.materials}</p>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Technology</h3>
                <ul className="mt-3 space-y-2 text-sm text-volt-graphite/80">
                  {product.technology.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-1.5 inline-block size-1.5 shrink-0 bg-volt-orange" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Fit</h3>
                <p className="mt-3 text-sm leading-relaxed text-volt-graphite/80">{product.fit}</p>
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Care</h3>
                <ul className="mt-3 space-y-2 text-sm text-volt-graphite/80">
                  {product.care.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-1.5 inline-block size-1.5 shrink-0 bg-volt-orange" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'reviews' && <ReviewsSection product={product} reviews={reviews} onAdded={(r) => setReviews((prev) => [r, ...prev])} />}
        </div>

        {/* Related products */}
        <section className="mt-20" aria-labelledby="related-heading">
          <h2 id="related-heading" className="display text-2xl text-volt-black sm:text-4xl">You may also like</h2>
          {related.length === 0 ? (
            <div className="mt-8"><ProductGridSkeleton count={4} /></div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {related.map((p, i) => (
                <AnimatedContent key={p.id} distance={30} direction="vertical" delay={i * 60} duration={0.5}>
                  <ProductCard product={p} index={i} />
                </AnimatedContent>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Size guide modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Size guide">
          <div className="absolute inset-0 bg-volt-black/60" onClick={() => setShowSizeGuide(false)} aria-hidden />
          <div className="relative z-10 w-full max-w-lg bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="display text-2xl">Size Guide</h2>
              <button type="button" onClick={() => setShowSizeGuide(false)} aria-label="Close size guide" className="flex size-9 items-center justify-center hover:bg-volt-mist">
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-volt-graphite/70">
              {product.name} — {product.gender === 'kids' ? 'Kids sizing' : 'Unisex sizing'}. If between sizes, we recommend sizing up.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-volt-black text-left text-white">
                    <th className="border border-volt-black px-3 py-2 text-xs font-display uppercase tracking-wider">Size</th>
                    <th className="border border-volt-black px-3 py-2 text-xs font-display uppercase tracking-wider">Foot length</th>
                    <th className="border border-volt-black px-3 py-2 text-xs font-display uppercase tracking-wider">EU</th>
                  </tr>
                </thead>
                <tbody>
                  {product.sizes.map((s) => {
                    const num = Number(s.size.replace(/\D/g, '')) || 40
                    const cm = s.size.startsWith('US') ? Math.round((num + 1.5) * 0.667 * 10) / 10 : num + 22
                    return (
                      <tr key={s.size} className="odd:bg-volt-smoke">
                        <td className="border border-volt-line px-3 py-2 font-semibold">{s.size}</td>
                        <td className="border border-volt-line px-3 py-2">{cm} cm</td>
                        <td className="border border-volt-line px-3 py-2">{num + 33}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-volt-graphite/60">
              Measurement note: foot length is approximate. For apparel, chest/waist sizing applies — see product fit description.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
