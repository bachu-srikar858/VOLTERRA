import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Preloader } from './Preloader'
import { Toasts } from './Toasts'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchOverlay } from '@/components/search/SearchOverlay'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export function Layout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Preloader />
      <Header />
      <main
        ref={mainRef}
        key={location.pathname}
        className="flex-1 animate-fade-up"
        style={{ animationDuration: '300ms' }}
      >
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <Toasts />
    </div>
  )
}
