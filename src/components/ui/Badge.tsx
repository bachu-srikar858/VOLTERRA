import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'black' | 'orange' | 'outline' | 'success' | 'danger'

const tones: Record<BadgeTone, string> = {
  black: 'bg-volt-black text-white',
  orange: 'bg-volt-orange text-white',
  outline: 'border border-volt-black/20 text-volt-graphite',
  success: 'bg-volt-black/5 text-volt-graphite border border-volt-line',
  danger: 'bg-volt-orange/10 text-volt-orange-dark border border-volt-orange/30',
}

export function Badge({
  children,
  tone = 'black',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
