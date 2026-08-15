import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { ProductForm, emptyFormData, toFormData, type ProductFormData } from '@/components/admin/ProductForm'
import { formatPrice } from '@/lib/utils'
import type { Category, Product } from '@/lib/types'

export default function AdminProducts() {
  const { toast } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    const [prods, cats] = await Promise.all([api.getProducts({}), api.getCategories()])
    setProducts(prods)
    setCategories(cats)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = async (data: ProductFormData) => {
    setSaving(true)
    try {
      if (editing) {
        await api.updateProduct(editing.id, data)
        toast('Product updated')
      } else {
        await api.createProduct(data)
        toast('Product created')
      }
      setFormOpen(false)
      setEditing(null)
      await refresh()
    } catch (e) {
      toast('Could not save product', 'error')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try {
      await api.deleteProduct(p.id)
      toast('Product deleted', 'info')
      await refresh()
    } catch (e) {
      toast('Could not delete product', 'error')
      console.error(e)
    }
  }

  const filtered = products.filter((p) =>
    search ? [p.name, p.categoryName, p.sku, ...p.tags].join(' ').toLowerCase().includes(search.toLowerCase()) : true,
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.08em]">Products ({products.length})</h2>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-48 border border-volt-line px-3 py-2 text-xs focus:border-volt-black focus:outline-none"
          />
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" /> Add product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-volt-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-volt-smoke text-left text-[11px] font-display font-bold uppercase tracking-[0.1em] text-volt-graphite/70">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-volt-line">
              {filtered.map((p) => {
                const stock = p.sizes.reduce((s, sz) => s + sz.stock, 0)
                return (
                  <tr key={p.id} className="hover:bg-volt-smoke/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-10 bg-volt-mist object-cover" />
                        <div>
                          <Link to={`/product/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                          <p className="text-xs text-volt-graphite/60">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{p.categoryName}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[11px] font-bold uppercase ${stock === 0 ? 'bg-red-100 text-red-700' : stock <= 10 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {stock === 0 ? 'Out' : stock <= 10 ? `${stock} left` : `${stock} in stock`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold">
                        <Star className="size-3.5 fill-volt-black text-volt-black" /> {p.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => { setEditing(p); setFormOpen(true) }} aria-label={`Edit ${p.name}`} className="flex size-8 items-center justify-center text-volt-graphite/60 hover:bg-volt-mist hover:text-volt-black">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="flex size-8 items-center justify-center text-volt-graphite/60 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-volt-graphite/60">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductForm
        key={editing?.id ?? 'new'}
        open={formOpen}
        initial={editing ? toFormData(editing) : emptyFormData(categories[0]?.name ?? 'Running', categories[0]?.id ?? 'cat-running')}
        categories={categories}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={save}
        saving={saving}
      />
    </div>
  )
}
