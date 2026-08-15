import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/context/StoreContext'
import { demoAdminDB, demoDB } from '@/lib/api'
import { Rating } from '@/components/ui/Rating'
import { formatDate } from '@/lib/utils'
import type { Product, Review } from '@/lib/types'

export default function AdminReviews() {
  const { toast } = useStore()
  const [reviews, setReviews] = useState<(Review & { productName?: string })[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const refresh = useCallback(() => {
    const db = demoAdminDB()
    setProducts(db.products)
    setReviews(db.reviews.map((r) => ({ ...r, productName: db.products.find((p) => p.id === r.productId)?.name })))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = (id: string) => {
    if (!window.confirm('Delete this review?')) return
    const db = demoAdminDB()
    db.reviews = db.reviews.filter((r) => r.id !== id)
    demoDB.save(db)
    toast('Review deleted', 'info')
    refresh()
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.08em]">Reviews ({reviews.length})</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border border-volt-line text-sm">
          <thead>
            <tr className="bg-volt-smoke text-left text-[11px] font-display font-bold uppercase tracking-[0.1em] text-volt-graphite/70">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-volt-line">
            {reviews.map((r) => (
              <tr key={r.id} className="align-top hover:bg-volt-smoke/50">
                <td className="px-4 py-3 text-xs font-medium">{r.productName ?? r.productId}</td>
                <td className="px-4 py-3 font-medium">{r.userName}</td>
                <td className="px-4 py-3"><Rating value={r.rating} size="sm" /></td>
                <td className="max-w-xs px-4 py-3">
                  <p className="text-xs font-semibold">{r.title}</p>
                  <p className="mt-0.5 text-xs text-volt-graphite/70 line-clamp-2">{r.body}</p>
                </td>
                <td className="px-4 py-3 text-xs text-volt-graphite/60">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => remove(r.id)} className="text-xs font-semibold text-volt-graphite/60 underline-offset-4 hover:text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-volt-graphite/60">No reviews yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="mt-4 text-xs text-volt-graphite/60">Loading products…</p>}
    </div>
  )
}
