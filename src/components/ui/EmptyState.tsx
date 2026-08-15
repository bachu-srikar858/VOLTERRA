import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  actionLabel,
  dark = false,
}: {
  icon: LucideIcon
  title: string
  message: string
  action?: () => void
  actionLabel?: string
  dark?: boolean
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-20 text-center', dark ? 'bg-volt-black text-white' : 'bg-white text-volt-black')}>
      <div className="flex size-16 items-center justify-center border border-current/20">
        <Icon className="size-7" strokeWidth={1.5} />
      </div>
      <h2 className="display mt-6 text-2xl">{title}</h2>
      <p className={cn('mt-3 max-w-sm text-sm leading-relaxed', dark ? 'text-white/60' : 'text-volt-graphite/70')}>
        {message}
      </p>
      {action && actionLabel && (
        <Button onClick={action} variant={dark ? 'light' : 'primary'} className="mt-8">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
