import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, SearchX, SlidersHorizontal, X } from 'lucide-react'
import BlurText from '@/components/ReactBits/BlurText'
import { ProductCard } from '@/components/product/ProductCard'
import { QuickView } from '@/components/product/QuickView'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Drawer } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSEO } from '@/lib/seo'
import { api } from '@/lib/api'
import { COLOR_HEXES, GENDERS, SHOE_SIZES, APPAREL_SIZES } from '@/lib/constants'
import type { Product, SortOption } from '@/lib/types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12
const ALL_SIZES = [...new Set([...SHOE_SIZES, ...APPAREL_SIZES])]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name A–Z' },
]

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [gender, setGender] = useState(searchParams.get('gender') ?? '')
  const [saleOnly, setSaleOnly] = useState(searchParams.get('sale') === '1')
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState<SortOption>('featured')
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300])
  const [priceApplied, setPriceApplied] = useState(false)

  const debounceRef = useRef<number>(0)
  const initializedRef = useRef(false)

  // Sync filter state when the URL query changes (e.g. header nav links)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      return
    }
    setCategory(searchParams.get('category') ?? '')
    setGender(searchParams.get('gender') ?? '')
    setSaleOnly(searchParams.get('sale') === '1')
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (category) n++
    if (gender) n++
    if (saleOnly) n++
    if (query) n++
    if (sizes.length) n++
    if (colors.length) n++
    if (priceApplied) n++
    return n
  }, [category, gender, saleOnly, query, sizes, colors, priceApplied])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const list = await api.getProducts({
      category: category || undefined,
      gender: (gender as 'men' | 'women' | 'unisex' | 'kids') || undefined,
      sizes,
      colors,
      minPrice: priceApplied ? priceRange[0] : undefined,
      maxPrice: priceApplied ? priceRange[1] : undefined,
      sale: saleOnly || undefined,
      search: query || undefined,
      sort,
    })
    setProducts(list)
    setVisible(PAGE_SIZE)
    setLoading(false)
  }, [category, gender, sizes, colors, priceApplied, priceRange, saleOnly, query, sort])

  useEffect(() => {
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => void loadProducts(), query ? 250 : 0)
    return () => window.clearTimeout(debounceRef.current)
  }, [loadProducts, query])

  const title = useMemo(() => {
    if (query) return `Search: ${query}`
    if (category) return category.charAt(0).toUpperCase() + category.slice(1)
    if (gender) return gender.charAt(0).toUpperCase() + gender.slice(1)
    if (saleOnly) return 'Sale'
    return 'All Products'
  }, [query, category, gender, saleOnly])

  useSEO(title, `Shop ${title.toLowerCase()} at VOLTERRA. Premium performance sportswear with free shipping over $150.`)

  const clearAll = () => {
    setCategory('')
    setGender('')
    setSaleOnly(false)
    setQuery('')
    setSizes([])
    setColors([])
    setPriceRange([0, 300])
    setPriceApplied(false)
    setSort('featured')
  }

  const toggleSize = (s: string) => setSizes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
  const toggleColor = (c: string) => setColors((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  const filterPanel = (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-black">Category</legend>
        <div className="mt-3 space-y-2">
          {[
            { value: '', label: 'All' },
            { value: 'running', label: 'Running' },
            { value: 'training', label: 'Training' },
            { value: 'lifestyle', label: 'Lifestyle' },
            { value: 'basketball', label: 'Basketball' },
          ].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="radio" name="category" checked={category === opt.value} onChange={() => setCategory(opt.value)} className="size-4 accent-volt-black" />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-black">Gender</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGender(gender === g.value ? '' : g.value)}
              aria-pressed={gender === g.value}
              className={cn(
                'border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors',
                gender === g.value ? 'border-volt-black bg-volt-black text-white' : 'border-volt-line hover:border-volt-graphite',
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-black">Size</legend>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              aria-pressed={sizes.includes(s)}
              className={cn(
                'border px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
                sizes.includes(s) ? 'border-volt-orange bg-volt-orange text-white' : 'border-volt-line hover:border-volt-black',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-black">Color</legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {Object.entries(COLOR_HEXES).map(([name, hex]) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleColor(name)}
              aria-label={`Filter by ${name}`}
              aria-pressed={colors.includes(name)}
              title={name}
              className={cn(
                'relative size-8 rounded-full border transition-all',
                colors.includes(name) ? 'border-volt-orange ring-2 ring-volt-orange/30' : 'border-volt-black/15 hover:scale-110',
              )}
              style={{ backgroundColor: hex }}
            >
              <span className="sr-only">{name}</span>
            </button>
          ))}
        </div>
        {colors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {colors.map((c) => (
              <span key={c} className="flex items-center gap-1 border border-volt-line px-2 py-1 text-[11px]">
                {c}
                <button type="button" onClick={() => toggleColor(c)} aria-label={`Remove ${c}`} className="ml-0.5 text-volt-graphite/60 hover:text-volt-orange-dark">
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-black">Price</legend>
        <div className="mt-3 flex items-center gap-3">
          <Input type="number" min={0} value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])} aria-label="Minimum price" className="px-3 py-2 text-xs" />
          <span className="text-volt-graphite/50">—</span>
          <Input type="number" min={0} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])} aria-label="Maximum price" className="px-3 py-2 text-xs" />
          <Button size="sm" variant="outline" onClick={() => { setPriceApplied(true); setFiltersOpen(false) }}>
            Apply
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: 'Under $100', min: 0, max: 100 },
            { label: '$100–$150', min: 100, max: 150 },
            { label: '$150+', min: 150, max: 9999 },
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => { setPriceRange([r.min, r.max === 9999 ? 300 : r.max]); setPriceApplied(true) }}
              className="border border-volt-line px-2.5 py-1 text-[11px] font-medium hover:border-volt-black"
            >
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} className="size-4 accent-volt-black" />
        On sale only
      </label>

      {activeFilterCount > 0 && (
        <button type="button" onClick={clearAll} className="text-xs font-semibold text-volt-orange-dark underline-offset-4 hover:underline">
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  )

  const visibleProducts = products.slice(0, visible)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 pt-24 sm:px-6 lg:px-10 lg:pt-28">
        <header className="mb-8">
          <BlurText text={title} className="display text-4xl text-volt-black sm:text-6xl" animateBy="words" delay={30} stepDuration={0.12} direction="top" />
          <p className="mt-3 text-sm text-volt-graphite/70">
            {loading ? 'Loading…' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
          </p>
        </header>

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-volt-line py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 border border-volt-black px-4 py-2.5 text-xs font-display font-bold uppercase tracking-[0.12em] transition-colors hover:bg-volt-black hover:text-white lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-volt-orange text-[10px] text-white">{activeFilterCount}</span>
              )}
            </button>
            <div className="hidden items-center border border-volt-line lg:flex" role="group" aria-label="View mode">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
                className={cn('flex size-10 items-center justify-center transition-colors', view === 'grid' ? 'bg-volt-black text-white' : 'text-volt-graphite hover:bg-volt-mist')}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                aria-label="List view"
                className={cn('flex size-10 items-center justify-center transition-colors', view === 'list' ? 'bg-volt-black text-white' : 'text-volt-graphite hover:bg-volt-mist')}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="sort-select" className="hidden text-xs font-medium text-volt-graphite/70 sm:block">Sort by</label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="cursor-pointer border border-volt-line bg-white px-3 py-2.5 text-xs font-semibold focus:border-volt-black focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
            {filterPanel}
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Nothing found"
                message="No products match your filters. Try removing a filter or searching for something different."
                action={clearAll}
                actionLabel="Clear filters"
              />
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onQuickView={setQuickView} />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-volt-line">
                {visibleProducts.map((p) => (
                  <li key={p.id} className="flex gap-6 py-6">
                    <a href={`/product/${p.slug}`} className="block w-28 shrink-0 bg-volt-mist sm:w-36">
                      <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                    </a>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-[11px] font-display font-bold uppercase tracking-[0.12em] text-volt-graphite/60">{p.categoryName}</p>
                      <a href={`/product/${p.slug}`} className="mt-1 font-display text-lg font-bold uppercase tracking-[0.02em] hover:text-volt-orange">
                        {p.name}
                      </a>
                      <p className="mt-2 line-clamp-2 max-w-xl text-sm text-volt-graphite/70">{p.description}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="font-display text-base font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.price)}</span>
                        <button type="button" onClick={() => setQuickView(p)} className="text-xs font-semibold text-volt-black underline-offset-4 hover:underline">
                          Quick view
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loading && products.length > visible && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more ({products.length - visible} remaining)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="bottom" title="Filters">
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between border-b border-volt-line px-5 py-4">
            <h2 className="font-display text-base font-bold uppercase tracking-[0.1em]">Filters</h2>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="flex size-9 items-center justify-center hover:bg-volt-mist">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
          <div className="border-t border-volt-line p-4">
            <Button fullWidth onClick={() => setFiltersOpen(false)}>Show {loading ? '…' : `${products.length} results`}</Button>
          </div>
        </div>
      </Drawer>

      <QuickView product={quickView} open={quickView !== null} onClose={() => setQuickView(null)} />
    </div>
  )
}
