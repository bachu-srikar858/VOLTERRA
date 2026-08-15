import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo } from './Logo'
import { NAV_LINKS } from './Header'
import { useStore } from '@/context/StoreContext'

export function Footer() {
  const { toast, user } = useStore()
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-volt-black text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Premium performance sportswear engineered for every version of you. Running, training, basketball and lifestyle — built to move without limits.
            </p>
            <form
              className="mt-8 max-w-sm"
              onSubmit={(e) => {
                e.preventDefault()
                if (!email.includes('@')) {
                  toast('Enter a valid email address', 'error')
                  return
                }
                toast("You're on the list. Welcome to VOLTERRA.")
                setEmail('')
              }}
            >
              <label htmlFor="newsletter-email" className="text-xs font-display font-bold uppercase tracking-[0.14em] text-white/50">
                Join the movement
              </label>
              <div className="mt-2 flex border-b border-white/25 transition-colors focus-within:border-volt-orange">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="flex items-center gap-1 px-2 text-xs font-display font-bold uppercase tracking-[0.12em] text-white transition-colors hover:text-volt-orange"
                >
                  Join <ArrowRight className="size-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-display font-bold uppercase tracking-[0.14em] text-white/50">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/80 transition-colors hover:text-volt-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-display font-bold uppercase tracking-[0.14em] text-white/50">Help</p>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: 'My Account', to: '/account' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'Shipping & Returns', to: '/help/shipping' },
                { label: 'Size Guide', to: '/help/size-guide' },
                { label: 'Contact', to: '/help/contact' },
                ...(user?.isAdmin ? [{ label: 'Admin dashboard', to: '/admin' }] : []),
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/80 transition-colors hover:text-volt-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-display font-bold uppercase tracking-[0.14em] text-white/50">Follow</p>
            <div className="mt-4 flex gap-3">
              {[
                { label: 'Instagram', path: 'M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9c-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 2.2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm6.4-3.8a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z' },
                { label: 'X / Twitter', path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z' },
                { label: 'YouTube', path: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z' },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className="flex size-10 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-volt-orange hover:text-volt-orange"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-white/40">
              Free shipping on orders over $150.
              <br />
              30-day returns. No questions.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} VOLTERRA. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
            {['Privacy Policy', 'Terms of Use', 'Cookie Settings', 'Accessibility'].map((l) => (
              <li key={l}>
                <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
