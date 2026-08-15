import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  labelledBy?: string
  children: ReactNode
  className?: string
  panelClassName?: string
  hideClose?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  labelledBy,
  children,
  className,
  panelClassName,
  hideClose = false,
}: ModalProps) {
  useLockScroll(open)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const focusable = panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const prevActive = document.activeElement as HTMLElement | null
    focusable?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      prevActive?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={cn('fixed inset-0 z-[100] flex items-center justify-center p-4', className)}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-labelledby={labelledBy}
    >
      <div
        className="absolute inset-0 bg-volt-black/60 backdrop-blur-[2px] animate-fade-up"
        style={{ animationDuration: '200ms' }}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-full max-w-lg bg-white shadow-2xl animate-fade-up',
          panelClassName,
        )}
        style={{ animationDuration: '300ms' }}
      >
        {!hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center bg-white/90 text-volt-black transition-colors hover:bg-volt-black hover:text-white"
          >
            <X className="size-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'right' | 'left' | 'bottom'
  className?: string
  labelledBy?: string
}

export function Drawer({ open, onClose, title, children, side = 'right', className, labelledBy }: DrawerProps) {
  useLockScroll(open)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const focusable = panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const prevActive = document.activeElement as HTMLElement | null
    focusable?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      prevActive?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const placement =
    side === 'right'
      ? 'inset-y-0 right-0 w-full max-w-md translate-x-0'
      : side === 'left'
        ? 'inset-y-0 left-0 w-full max-w-xs translate-x-0'
        : 'inset-x-0 bottom-0 max-h-[85vh] translate-y-0 rounded-t-sm'

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={title} aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-volt-black/50" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        className={cn(
          'absolute bg-white shadow-2xl transition-transform duration-300 ease-out',
          placement,
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
