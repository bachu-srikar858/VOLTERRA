import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import SplitText from '@/components/ReactBits/SplitText'
import { ProductCard } from '@/components/product/ProductCard'
import { QuickView } from '@/components/product/QuickView'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PackageX } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { api } from '@/lib/api'
import type { Collection, Product } from '@/lib/types'

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickView, setQuickView] = useState<Product | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const [cols, all] = await Promise.all([api.getCollections(), api.getProducts({})])
      const col = cols.find((c) => c.slug === slug) ?? null
      if (cancelled) return
      setCollection(col)
      if (col) {
        const slugs = new Set(col.productSlugs)
        const cats = new Set(col.categorySlugs)
        setProducts(all.filter((p) => slugs.has(p.slug) || cats.has(p.categoryName.toLowerCase())))
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  useSEO(collection ? collection.name : undefined, collection ? `${collection.name} — ${collection.tagline} — VOLTERRA` : undefined)

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
        <div className="skeleton h-[50vh] w-full" />
        <div className="mt-10"><ProductGridSkeleton count={6} /></div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32">
        <EmptyState
          icon={PackageX}
          title="Collection not found"
          message="This collection doesn't exist or has been archived."
          action={() => navigate('/collections')}
          actionLabel="All collections"
        />
      </div>
    )
  }

  return (
    <div>
      {/* Editorial header */}
      <section className={`relative overflow-hidden ${collection.dark ? 'bg-volt-black' : 'bg-volt-mist'}`}>
        <img src={collection.image} alt={collection.name} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-volt-black/90 via-volt-black/40 to-volt-black/20" aria-hidden />
        <div className="relative mx-auto max-w-[1440px] px-4 py-32 sm:px-6 lg:px-10 lg:py-44">
          <Link to="/collections" className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-volt-orange">
            <ArrowLeft className="size-3.5" /> All collections
          </Link>
          <SplitText
            text={collection.name}
            className="display mt-4 text-6xl text-white sm:text-8xl lg:text-9xl"
            tag="h1"
            delay={40}
            duration={0.8}
            splitType="chars"
            from={{ opacity: 0, y: 60 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="left"
            threshold={0.1}
            rootMargin="0px"
          />
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">“{collection.tagline}”</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{collection.description}</p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold uppercase tracking-[0.1em]">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </h2>
          <Link to={`/shop?category=${collection.categorySlugs[0] ?? 'running'}`} className="group inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.14em] hover:text-volt-orange">
            Shop all {collection.categorySlugs[0] ?? 'running'}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onQuickView={setQuickView} />
          ))}
        </div>
      </section>

      <QuickView product={quickView} open={quickView !== null} onClose={() => setQuickView(null)} />
    </div>
  )
}
