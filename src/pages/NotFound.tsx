import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSEO } from '@/lib/seo'

export default function NotFound() {
  useSEO('Lost Your Way?', 'The page you are looking for does not exist. Head back home to VOLTERRA.')
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-volt-black px-4 py-32 text-center text-white">
      <p className="font-mono text-sm tracking-[0.4em] text-volt-orange">404</p>
      <h1 className="display mt-6 text-5xl sm:text-8xl">LOST YOUR WAY?</h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
        The page you're looking for doesn't exist. It may have been moved, or the link may be broken.
      </p>
      <Link
        to="/"
        className="group mt-10 inline-flex items-center gap-2 bg-volt-orange px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-volt-black"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back home
      </Link>
    </div>
  )
}
