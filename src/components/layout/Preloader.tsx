import { useEffect, useState } from 'react'

export function Preloader() {
  const [done, setDone] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setDone(true), 950)
    const t2 = window.setTimeout(() => setHidden(true), 1500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-volt-black transition-opacity duration-500"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? 'none' : 'auto' }}
      aria-hidden
    >
      <p className="display text-4xl text-white sm:text-6xl" style={{ fontStretch: '125%' }}>
        VOLTERRA<span className="text-volt-orange">.</span>
      </p>
      <div className="mt-6 h-px w-40 overflow-hidden bg-white/15">
        <div className="h-full w-full origin-left bg-volt-orange transition-transform duration-700 ease-out" style={{ transform: done ? 'scaleX(1)' : 'scaleX(0.15)', transitionDelay: '150ms' }} />
      </div>
      <p className="mt-4 text-[10px] font-display font-bold uppercase tracking-[0.4em] text-white/40">
        Move without limits
      </p>
    </div>
  )
}
