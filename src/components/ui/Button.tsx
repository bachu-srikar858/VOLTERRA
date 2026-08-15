import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'outline' | 'ghost' | 'light' | 'dark' | 'orange'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-volt-black text-white hover:bg-volt-orange active:bg-volt-orange-dark border border-volt-black',
  outline:
    'border border-volt-black text-volt-black hover:bg-volt-black hover:text-white',
  ghost: 'text-volt-black hover:bg-volt-mist',
  light: 'bg-white text-volt-black hover:bg-volt-orange hover:text-white',
  dark: 'bg-volt-black text-white border border-white/20 hover:border-white hover:bg-volt-orange hover:border-volt-orange',
  orange: 'bg-volt-orange text-white hover:bg-volt-orange-dark',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-sm',
  xl: 'h-14 px-10 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, fullWidth = false, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-[0.12em] transition-all duration-300 ease-out cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
})
