import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, Flame, Search, TrendingUp, X } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { addRecentSearch, clearRecentSearches, loadRecentSearches } from '@/lib/demo/db'
import BlurText from '@/components/ReactBits/BlurText'
import type { Category, Collection, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

const TRENDING = ['Running', 'Trail', 'Basketball', 'Reflective', 'Summer Motion', 'Leggings']

interface Results {
  products: Product[]
  categories: Category[]
  collections: Collection[]
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Results>({ products: [], categories: [], collections: [] })
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debounceRef = useRef<number>(0)

  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setResults({ products: [], categories: [], collections: [] })
      setRecent(loadRecentSearches())
      window.setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [searchOpen])

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim()
    if (!term) {
      setResults({ products: [], categories: [], collections: [] })
      setLoading(false)
      return
    }
    setLoading(true)
    const [products, categories, collections] = await Promise.all([
      api.getProducts({ search: term }),
      api.getCategories(),
      api.getCollections(),
    ])
    const t = term.toLowerCase()
    setResults({
      products: products.slice(0, 8),
      categories: categories.filter((c) => c.name.toLowerCase().includes(t) || c.description.toLowerCase().includes(t)),
      collections: collections.filter((c) => c.name.toLowerCase().includes(t) || c.tagline.toLowerCase().includes(t)),
    })
    setLoading(false)
  }, [])

  const onQueryChange = (value: string) => {
    setQuery(value)
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => runSearch(value), 220)
  }

  const go = (path: string, term?: string) => {
    if (term) addRecentSearch(term)
    setSearchOpen(false)
    navigate(path)
  }

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const map = new Map<string, { label: string; slug: string }>()
    results.products.forEach((p) => {
      map.set(`p-${p.id}`, { label: p.name, slug: `/product/${p.slug}` })
    })
    results.categories.forEach((c) => map.set(`c-${c.id}`, { label: `${c.name} (${c.description})`, slug: `/shop?category=${c.slug}` }))
    results.collections.forEach((c) => map.set(`col-${c.id}`, { label: `${c.name} — ${c.tagline}`, slug: `/collections/${c.slug}` }))
    return [...map.values()]
  }, [results, query])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const pool = ['Running shoes', 'Running jackets', 'Running shorts', 'Running accessories', 'Basketball shoes', 'Training tees', 'Leggings', 'Hoodies', 'Trail running', 'Reflective gear']
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 5)
  }, [query])

  if (!searchOpen) return null

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-volt-black/70 backdrop-blur-sm" onClick={() => setSearchOpen(false)} aria-hidden />
      <div className="absolute inset-x-0 top-0 max-h-[90vh] overflow-y-auto bg-white shadow-2xl animate-fade-up" style={{ animationDuration: '350ms' }}>
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <BlurText text="Search" className="display text-3xl sm:text-4xl" animateBy="letters" delay={40} stepDuration={0.08} direction="top" />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="flex size-10 items-center justify-center bg-volt-black text-white transition-colors hover:bg-volt-orange"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Input */}
          <div className="relative mt-6 border-b-2 border-volt-black pb-2">
            <Search className="absolute left-0 top-1/2 size-5 -translate-y-1/2 text-volt-black" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  go(`/shop?q=${encodeURIComponent(query.trim())}`, query.trim())
                }
              }}
              placeholder="Search products, categories, collections…"
              aria-label="Search products"
              className="w-full bg-transparent pl-9 text-xl font-medium text-volt-black placeholder:text-volt-graphite/40 focus:outline-none sm:text-2xl"
            />
          </div>

          {/* Idle state: recent + trending */}
          {!query.trim() && (
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-graphite/60">
                  <Clock className="size-3.5" /> Recent searches
                </p>
                {recent.length === 0 ? (
                  <p className="mt-3 text-sm text-volt-graphite/50">No recent searches yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => onQueryChange(r)}
                          className="group flex w-full items-center justify-between py-1.5 text-sm text-volt-black hover:text-volt-orange"
                        >
                          {r}
                          <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {recent.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentSearches()
                      setRecent([])
                    }}
                    className="mt-3 text-xs text-volt-graphite/60 underline-offset-4 hover:underline"
                  >
                    Clear history
                  </button>
                )}
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-graphite/60">
                  <Flame className="size-3.5 text-volt-orange" /> Trending
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onQueryChange(t)}
                      className="border border-volt-line px-3 py-1.5 text-xs font-medium text-volt-black transition-colors hover:border-volt-black hover:bg-volt-black hover:text-white"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suggestions while typing */}
          {query.trim() && !loading && grouped.length === 0 && suggestions.length > 0 && (
            <div className="mt-6">
              <p className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-graphite/60">
                <TrendingUp className="size-3.5" /> Suggestions
              </p>
              <ul className="mt-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => go(`/shop?q=${encodeURIComponent(s)}`, s)}
                      className="flex w-full items-center justify-between border-b border-volt-line py-3 text-left text-sm text-volt-black hover:text-volt-orange"
                    >
                      {s}
                      <Search className="size-3.5 text-volt-graphite/40" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[4/5] w-full" />
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && grouped.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-display font-bold uppercase tracking-[0.14em] text-volt-graphite/60">
                Results for “{query.trim()}”
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {results.products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => go(`/product/${p.slug}`)}
                    className="text-left"
                  >
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-[4/5] w-full bg-volt-mist object-cover" />
                    <p className="mt-2 text-sm font-semibold">{p.name}</p>
                    <p className="text-sm text-volt-graphite/70">{p.categoryName}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {results.categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => go(`/shop?category=${c.slug}`, c.name)}
                    className="border border-volt-line px-4 py-2 text-xs font-medium transition-colors hover:border-volt-black hover:bg-volt-black hover:text-white"
                  >
                    {c.name}
                  </button>
                ))}
                {results.collections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => go(`/collections/${c.slug}`, c.name)}
                    className="border border-volt-black bg-volt-black px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-volt-orange hover:border-volt-orange"
                  >
                    {c.name} Collection
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && grouped.length === 0 && suggestions.length === 0 && (
            <div className="mt-10 pb-6 text-center">
              <p className="font-display text-xl font-bold uppercase">No results for “{query.trim()}”</p>
              <p className="mt-2 text-sm text-volt-graphite/70">Check the spelling or try a broader term.</p>
              <button
                type="button"
                onClick={() => go(`/shop?q=${encodeURIComponent(query.trim())}`, query.trim())}
                className="mt-6 inline-flex items-center gap-2 border border-volt-black px-6 py-3 font-display text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:bg-volt-black hover:text-white"
              >
                Browse all results <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}

          {/* Footer action */}
          {!loading && query.trim() && grouped.length > 0 && (
            <button
              type="button"
              onClick={() => go(`/shop?q=${encodeURIComponent(query.trim())}`, query.trim())}
              className={cn('mt-8 mb-2 flex items-center gap-2 text-sm font-semibold text-volt-black underline-offset-4 hover:text-volt-orange hover:underline')}
            >
              View all results for “{query.trim()}” <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
