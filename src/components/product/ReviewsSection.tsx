import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { Rating } from '@/components/ui/Rating'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Product, Review } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ReviewsSection({
  product,
  reviews,
  onAdded,
}: {
  product: Product
  reviews: Review[]
  onAdded: (review: Review) => void
}) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const total = reviews.length
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : product.rating
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total ? (reviews.filter((r) => r.rating === star).length / total) * 100 : 0,
  }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !body.trim()) {
      setError('Please add your name and a review.')
      return
    }
    setSubmitting(true)
    try {
      const rev = await api.addReview(product.id, {
        userName: name.trim(),
        rating,
        title: title.trim() || 'Great product',
        body: body.trim(),
        date: new Date().toISOString().slice(0, 10),
        verified: false,
      })
      onAdded(rev)
      setName('')
      setTitle('')
      setBody('')
      setRating(5)
    } catch {
      setError('Could not submit your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-12 py-10 lg:grid-cols-2">
      {/* Summary */}
      <div>
        <div className="flex items-end gap-4">
          <span className="display text-6xl text-volt-black">{avg.toFixed(1)}</span>
          <div className="pb-1.5">
            <Rating value={avg} size="md" />
            <p className="mt-1 text-xs text-volt-graphite/60">{total} verified reviews</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-3 text-xs">
              <span className="w-3 font-semibold">{b.star}</span>
              <div className="h-1.5 flex-1 bg-volt-mist" role="presentation">
                <div className="h-full bg-volt-black" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-8 text-right text-volt-graphite/60">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list + form */}
      <div>
        <ul className="space-y-6">
          {reviews.length === 0 && (
            <li className="rounded-sm border border-dashed border-volt-line p-6 text-center text-sm text-volt-graphite/70">
              No reviews yet — be the first to review this product.
            </li>
          )}
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-volt-line pb-6 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{r.userName}</p>
                <p className="text-[11px] text-volt-graphite/50">{formatDate(r.date)}</p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Rating value={r.rating} size="sm" />
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-volt-graphite/60">
                    <CheckCircle2 className="size-3.5 text-volt-orange" /> Verified purchase
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-volt-graphite/80">{r.body}</p>
            </li>
          ))}
        </ul>

        {/* Form */}
        <form onSubmit={submit} className="mt-8 rounded-sm border border-volt-line p-6" aria-label="Write a review">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Write a review</h3>
          <div className="mt-3">
            <span className="block text-xs font-display font-bold uppercase tracking-[0.12em] text-volt-graphite">Your rating</span>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl leading-none transition-transform hover:scale-110"
                >
                  <StarIcon filled={star <= (hoverRating || rating)} />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Name" id="review-name" error={error ? ' ' : undefined}>
              <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Review title" id="review-title">
              <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" />
            </Field>
            <Field label="Review" id="review-body" error={error}>
              <Textarea id="review-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="How does it perform? Share your experience." />
            </Field>
          </div>
          {error && <p role="alert" className="mt-2 text-xs font-medium text-volt-orange-dark">{error}</p>}
          <Button type="submit" variant="primary" className="mt-4" loading={submitting}>
            <Send className="size-4" /> Submit review
          </Button>
        </form>
      </div>
    </div>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', filled ? 'fill-volt-black text-volt-black' : 'fill-transparent text-volt-line')} aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
