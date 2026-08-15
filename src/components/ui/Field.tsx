import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full border border-volt-line bg-white px-4 py-3 text-sm text-volt-black placeholder:text-volt-graphite/50 transition-colors focus:border-volt-black focus:outline-none disabled:opacity-50'

interface FieldWrapProps {
  label?: string
  error?: string
  hint?: string
  id: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, error, hint, id, children, className }: FieldWrapProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-xs font-display font-bold uppercase tracking-[0.12em] text-volt-graphite">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-volt-graphite/70">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-volt-orange-dark">
          {error}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(base, invalid && 'border-volt-orange', className)}
        {...props}
      />
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(base, 'cursor-pointer appearance-none pr-10', className)} {...props}>
        {children}
      </select>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(base, 'min-h-28 resize-y', className)} {...props} />
  },
)

export function Checkbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id: string
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-volt-graphite">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-volt-black"
      />
      <span>{label}</span>
    </label>
  )
}
