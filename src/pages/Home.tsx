import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'
import SplitText from '@/components/ReactBits/SplitText'
import BlurText from '@/components/ReactBits/BlurText'
import AnimatedContent from '@/components/ReactBits/AnimatedContent'
import ScrollVelocity from '@/components/ReactBits/ScrollVelocity'
import RotatingText from '@/components/ReactBits/RotatingText'
import { ProductCard } from '@/components/product/ProductCard'
import { QuickView } from '@/components/product/QuickView'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { useSEO } from '@/lib/seo'
import { api } from '@/lib/api'
import { HERO_IMAGE, categories, collections } from '@/lib/demo/seed'
import type { Product } from '@/lib/types'

export default function Home() {
  useSEO(undefined, 'Premium performance sportswear. Running, training, basketball and lifestyle gear engineered for every version of you.')
  const [trending, setTrending] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickView, setQuickView] = useState<Product | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const featured = await api.getProducts({ sort: 'featured' })
      if (!cancelled) {
        setTrending(featured.slice(0, 8))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-white">
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-volt-black" aria-label="Hero">
        <img
          src={HERO_IMAGE}
          alt="Athlete running at night under dramatic light"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-volt-black via-volt-black/45 to-volt-black/10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-volt-black/50 to-transparent" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-16 pt-40 sm:px-6 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-display font-bold uppercase tracking-[0.3em] text-volt-orange">
              <span className="inline-block h-px w-10 bg-volt-orange" aria-hidden />
              New Season · Volterra Performance
            </p>
            <SplitText
              text="MOVE WITHOUT"
              className="display text-[17vw] text-white sm:text-[13vw] lg:text-[8.5rem] xl:text-[10rem]"
              tag="h1"
              delay={30}
              duration={0.8}
              splitType="chars"
              from={{ opacity: 0, y: 70 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              threshold={0.1}
              rootMargin="0px"
            />
            <SplitText
              text="LIMITS"
              className="display text-[17vw] text-volt-orange sm:text-[13vw] lg:text-[8.5rem] xl:text-[10rem]"
              tag="h1"
              delay={90}
              duration={0.8}
              splitType="chars"
              from={{ opacity: 0, y: 70 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              threshold={0.1}
              rootMargin="0px"
            />
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
              Performance engineered for every version of you.
              <span className="ml-3 inline-flex align-middle">
                <RotatingText
                  texts={['RUN', 'TRAIN', 'COMPETE', 'RECOVER', 'REPEAT']}
                  mainClassName="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/90"
                  splitLevelClassName="overflow-hidden pb-1"
                  elementLevelClassName="inline-block"
                  staggerDuration={0.03}
                  rotationInterval={2400}
                />
              </span>
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop?gender=men"
                className="group inline-flex items-center justify-center gap-2 bg-volt-orange px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-white hover:text-volt-black"
              >
                Shop Men
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop?gender=women"
                className="group inline-flex items-center justify-center gap-2 border border-white/40 bg-transparent px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white backdrop-blur-[2px] transition-all duration-300 hover:border-white hover:bg-white hover:text-volt-black"
              >
                Shop Women
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-volt-line bg-volt-black py-4">
        <ScrollVelocity
          texts={[
            <span key="1" className="font-display text-lg font-extrabold uppercase tracking-[0.08em] text-white" style={{ fontStretch: '125%' }}>Move Without Limits</span>,
            <span key="2" className="font-display text-lg font-extrabold uppercase tracking-[0.08em] text-volt-orange" style={{ fontStretch: '125%' }}>Volterra Performance</span>,
            <span key="3" className="font-display text-lg font-extrabold uppercase tracking-[0.08em] text-white" style={{ fontStretch: '125%' }}>Engineered For Every Version Of You</span>,
          ]}
          velocity={40}
          numCopies={4}
          className="[&>*]:text-center"
        />
      </div>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24" aria-labelledby="categories-heading">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <BlurText text="Find Your Sport" className="display text-3xl text-volt-black sm:text-5xl" animateBy="words" delay={60} stepDuration={0.15} direction="top" />
            <p className="mt-3 text-sm text-volt-graphite/70">Explore gear built for the way you move.</p>
          </div>
          <Link to="/shop" className="group hidden items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-volt-black sm:flex">
            Shop all
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {categories.map((cat, i) => (
            <AnimatedContent key={cat.id} distance={40} direction="vertical" delay={i * 80} duration={0.6}>
              <Link to={`/shop?category=${cat.slug}`} className="group relative block overflow-hidden bg-volt-black">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-[1.07] group-hover:opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-volt-black/90 via-volt-black/25 to-transparent transition-opacity duration-500 group-hover:from-volt-black/95" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-[11px] font-display font-bold uppercase tracking-[0.24em] text-volt-orange">Volterra</p>
                  <h3 className="display mt-1 text-3xl text-white">{cat.name}</h3>
                  <p className="mt-2 max-w-[26ch] text-xs leading-relaxed text-white/70 opacity-80 transition-all duration-500 group-hover:opacity-100">{cat.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white transition-transform duration-500 group-hover:translate-x-1">
                    Explore
                    <ArrowUpRight className="size-4 text-volt-orange" />
                  </span>
                </div>
              </Link>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="bg-volt-smoke py-16 lg:py-24" aria-labelledby="trending-heading">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <BlurText text="Trending Now" className="display text-3xl text-volt-black sm:text-5xl" animateBy="words" delay={40} stepDuration={0.15} direction="top" />
              <p className="mt-3 text-sm text-volt-graphite/70">The gear the movement can't stop talking about.</p>
            </div>
            <Link to="/shop" className="group hidden items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-volt-black sm:flex">
              View all
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
              {trending.map((p, i) => (
                <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[32vw] lg:w-auto">
                  <ProductCard product={p} index={i} onQuickView={setQuickView} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24" aria-labelledby="collections-heading">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <BlurText text="Collections" className="display text-3xl text-volt-black sm:text-5xl" animateBy="words" delay={40} stepDuration={0.15} direction="top" />
            <p className="mt-3 text-sm text-volt-graphite/70">Curated drops, engineered for purpose.</p>
          </div>
          <Link to="/collections" className="group hidden items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-volt-black sm:flex">
            All collections
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {collections.map((col, i) => (
            <AnimatedContent key={col.id} distance={40} direction="vertical" delay={i * 120} duration={0.7}>
              <Link to={`/collections/${col.slug}`} className={`group relative block overflow-hidden ${col.dark ? 'bg-volt-black' : 'bg-volt-mist'}`}>
                <img
                  src={col.image}
                  alt={col.name}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-volt-black/85 via-volt-black/20 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-10">
                  <div>
                    <p className="text-[11px] font-display font-bold uppercase tracking-[0.24em] text-volt-orange">Volterra</p>
                    <h3 className="display mt-2 text-4xl text-white sm:text-6xl">{col.name}</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">“{col.tagline}”</p>
                  </div>
                  <span className="flex size-14 items-center justify-center border border-white/30 text-white transition-all duration-500 group-hover:border-volt-orange group-hover:bg-volt-orange">
                    <ArrowUpRight className="size-6" />
                  </span>
                </div>
              </Link>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="border-t border-volt-line bg-white" aria-label="Why VOLTERRA">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-volt-line px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-10">
          {[
            { icon: Truck, title: 'Free Shipping', body: 'On all orders over $150. Fast, tracked delivery worldwide.' },
            { icon: RefreshCcw, title: '30-Day Returns', body: 'Changed your mind? Send it back. No questions asked.' },
            { icon: ShieldCheck, title: 'Performance Promise', body: 'Every product is tested by athletes before it earns the mark.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4 px-2 py-10 sm:px-8">
              <Icon className="mt-0.5 size-6 shrink-0 text-volt-orange" strokeWidth={1.6} />
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-volt-graphite/70">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-volt-black py-20 text-center lg:py-28" aria-label="Join VOLTERRA">
        <BlurText text="Built For Your Best" className="display text-3xl text-white sm:text-6xl" animateBy="words" delay={40} stepDuration={0.12} direction="top" />
        <p className="mx-auto mt-5 max-w-xl px-4 text-sm leading-relaxed text-white/60 sm:text-base">
          Join VOLTERRA to save your wishlist, track orders and get early access to new drops and collections.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="bg-volt-orange px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-volt-black">
            Join now
          </Link>
          <Link to="/shop" className="border border-white/30 px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white hover:text-volt-black">
            Shop the drop
          </Link>
        </div>
      </section>

      <QuickView product={quickView} open={quickView !== null} onClose={() => setQuickView(null)} />
    </div>
  )
}
