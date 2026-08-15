import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-volt-line">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Logo />
          <Link to="/shop" className="text-xs font-medium text-volt-graphite underline-offset-4 hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <h1 className="display text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-volt-graphite/70">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-8 border-t border-volt-line pt-6 text-center text-sm text-volt-graphite/70">{footer}</div>
      </div>
    </div>
  )
}
