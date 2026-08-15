import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { cn } from '@/lib/utils'

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start gap-2.5 border-l-4 bg-volt-black px-4 py-3 text-sm text-white shadow-xl animate-fade-up',
            t.type === 'success' && 'border-volt-orange',
            t.type === 'error' && 'border-red-500',
            t.type === 'info' && 'border-white/40',
          )}
          style={{ animationDuration: '250ms' }}
        >
          {t.type === 'success' && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-volt-orange" />}
          {t.type === 'error' && <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />}
          {t.type === 'info' && <Info className="mt-0.5 size-4 shrink-0 text-white/60" />}
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
