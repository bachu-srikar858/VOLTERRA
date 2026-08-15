import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function AdminInventory() {
  const { toast } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [lowOnly, setLowOnly] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, Record<string, number>>>({})

  const refresh = async () => {
    setProducts(await api.getProducts({}))
  }

  useEffect(() => {
    void refresh()
  }, [])

  const totalStock = (p: Product) => p.sizes.reduce((s, sz) => s + sz.stock, 0)

  const setStock = (productId: string, size: string, value: number) => {
    setDrafts((prev) => ({ ...prev, [productId]: { ...(prev[productId] ?? {}), [size]: Math.max(0, value) } }))
  }

  const save = async (p: Product) => {
    const draft = drafts[p.id]
    if (!draft) return
    const sizes = p.sizes.map((s) => ({ size: s.size, stock: draft[s.size] ?? s.stock }))
    try {
      await api.updateProduct(p.id, { sizes })
      toast(`${p.name} stock updated`)
      await refresh()
    } catch (e) {
      toast('Could not update stock', 'error')
      console.error(e)
    }
  }

  const visible = lowOnly ? products.filter((p) => totalStock(p) <= 10) : products

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.08em]">Inventory ({products.length})</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="size-4 accent-volt-black" />
          Low stock only (≤ 10)
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {visible.map((p) => {
          const stock = totalStock(p)
          const draft = drafts[p.id]
          const dirty = draft && Object.keys(draft).length > 0
          return (
            <div key={p.id} className="border border-volt-line p-4">
              <div className="flex flex-wrap items-center gap-4">
                <img src={p.images[0]} alt="" className="h-14 w-14 bg-volt-mist object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                  <p className="text-xs text-volt-graphite/60">{p.sku}</p>
                  <p className="mt-1 text-xs font-medium">
                    {stock === 0 ? (
                      <span className="text-red-600">Out of stock</span>
                    ) : stock <= 10 ? (
                      <span className="text-amber-700">Only {stock} left</span>
                    ) : (
                      <span className="text-green-700">In stock ({stock})</span>
                    )}
                    {' · '}{formatPrice(p.price)}
                  </p>
                </div>
                {dirty && (
                  <Button size="sm" onClick={() => save(p)}>Save stock</Button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.sizes.map((s) => {
                  const value = draft?.[s.size] ?? s.stock
                  const changed = draft?.[s.size] != null && draft[s.size] !== s.stock
                  return (
                    <label key={s.size} className={`flex items-center gap-1.5 border px-2 py-1.5 text-xs ${changed ? 'border-volt-orange' : 'border-volt-line'}`}>
                      <span className="font-semibold">{s.size}</span>
                      <Input
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => setStock(p.id, s.size, Number(e.target.value) || 0)}
                        aria-label={`${p.name} ${s.size} stock`}
                        className="w-16 border-0 px-1 py-0.5 text-xs focus:border-0"
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-volt-graphite/60">
            {lowOnly ? 'Nothing is low on stock right now.' : 'No products found.'}
          </p>
        )}
      </div>
    </div>
  )
}
