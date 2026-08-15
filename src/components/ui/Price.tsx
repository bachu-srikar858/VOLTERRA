import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PriceProps {
  price: number
  compareAtPrice?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
}

export function Price({ price, compareAtPrice, size = 'md', className }: PriceProps) {
  const onSale = compareAtPrice != null && compareAtPrice > price
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn('font-semibold', sizes[size])}>{formatPrice(price)}</span>
      {onSale && (
        <span className={cn('text-volt-graphite/60 line-through', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </span>
  )
}
