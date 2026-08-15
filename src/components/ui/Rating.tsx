import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  size?: 'sm' | 'md'
  className?: string
  showValue?: boolean
}

export function Rating({ value, size = 'sm', className, showValue = false }: RatingProps) {
  const full = Math.floor(value)
  const hasHalf = value - full >= 0.4
  const dim = size === 'sm' ? 'size-3.5' : 'size-4'
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          if (i <= full) return <Star key={i} className={cn(dim, 'fill-volt-black text-volt-black')} />
          if (i === full + 1 && hasHalf)
            return (
              <span key={i} className="relative inline-flex">
                <Star className={cn(dim, 'text-volt-line')} />
                <StarHalf className={cn(dim, 'absolute inset-0 fill-volt-black text-volt-black')} />
              </span>
            )
          return <Star key={i} className={cn(dim, 'text-volt-line')} />
        })}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-volt-graphite">{value.toFixed(1)}</span>
      )}
    </span>
  )
}
