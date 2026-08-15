import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="VOLTERRA home"
      className={cn('group inline-flex items-baseline gap-0.5', className)}
    >
      <span
        className={cn(
          'font-display font-extrabold uppercase tracking-[0.02em] transition-colors',
          dark ? 'text-white' : 'text-volt-black',
        )}
        style={{ fontStretch: '125%', fontSize: '1.35em', lineHeight: 1 }}
      >
        VOLTERRA
      </span>
      <span
        className="inline-block size-1.5 translate-y-[-0.15em] bg-volt-orange transition-transform duration-300 group-hover:scale-150"
        aria-hidden
      />
    </Link>
  )
}
