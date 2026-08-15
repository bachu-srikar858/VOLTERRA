import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import BlurText from '@/components/ReactBits/BlurText'
import AnimatedContent from '@/components/ReactBits/AnimatedContent'
import { useSEO } from '@/lib/seo'
import { api } from '@/lib/api'
import type { Collection } from '@/lib/types'

export default function Collections() {
  useSEO('Collections', 'Explore VOLTERRA editorial collections — curated drops engineered for purpose.')
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    api.getCollections().then(setCollections)
  }, [])

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <BlurText text="Collections" className="display text-4xl sm:text-7xl" animateBy="words" delay={30} stepDuration={0.12} direction="top" />
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-volt-graphite/70 sm:text-base">
        Curated drops engineered for purpose. Each collection is a complete system — shoes, apparel and accessories built to work together.
      </p>

      <div className="mt-12 space-y-6">
        {collections.map((col, i) => (
          <AnimatedContent key={col.id} distance={40} direction="vertical" delay={i * 80} duration={0.6}>
            <Link
              to={`/collections/${col.slug}`}
              className={`group relative block overflow-hidden ${col.dark ? 'bg-volt-black' : 'bg-volt-mist'}`}
            >
              <img
                src={col.image}
                alt={col.name}
                loading="lazy"
                className="aspect-[16/7] w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-volt-black/90 via-volt-black/30 to-transparent" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-10">
                <div>
                  <p className="text-[11px] font-display font-bold uppercase tracking-[0.24em] text-volt-orange">Volterra</p>
                  <h2 className="display mt-2 text-4xl text-white sm:text-7xl">{col.name}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">“{col.tagline}”</p>
                </div>
                <span className="flex size-14 items-center justify-center border border-white/30 text-white transition-all duration-500 group-hover:border-volt-orange group-hover:bg-volt-orange">
                  <ArrowUpRight className="size-6" />
                </span>
              </div>
            </Link>
          </AnimatedContent>
        ))}
      </div>
    </div>
  )
}
