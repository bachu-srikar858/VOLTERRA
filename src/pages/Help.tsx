import { Link, useParams } from 'react-router-dom'
import { Mail, Ruler, Truck } from 'lucide-react'
import { useSEO } from '@/lib/seo'
import { SHOE_SIZES, APPAREL_SIZES } from '@/lib/constants'

const HELP_TOPICS = [
  { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
  { id: 'size-guide', label: 'Size Guide', icon: Ruler },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function Help() {
  const { topic = 'shipping' } = useParams<{ topic: string }>()
  useSEO(
    HELP_TOPICS.find((t) => t.id === topic)?.label ?? 'Help',
    `VOLTERRA help — ${HELP_TOPICS.find((t) => t.id === topic)?.label ?? 'support'}.`,
  )

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <h1 className="display text-4xl sm:text-6xl">Help Center</h1>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Help topics">
        {HELP_TOPICS.map((t) => (
          <Link
            key={t.id}
            to={`/help/${t.id}`}
            aria-current={topic === t.id ? 'page' : undefined}
            className={`inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-display font-bold uppercase tracking-[0.1em] transition-colors ${
              topic === t.id ? 'border-volt-black bg-volt-black text-white' : 'border-volt-line hover:border-volt-black'
            }`}
          >
            <t.icon className="size-4" /> {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10 border-t border-volt-line pt-8">
        {topic === 'shipping' && (
          <div className="space-y-6 text-sm leading-relaxed text-volt-graphite/90">
            <h2 className="display text-2xl">Shipping & Returns</h2>
            <p><strong>Free standard shipping</strong> on all orders over $150. Orders below that ship for $7.50.</p>
            <p><strong>Express delivery</strong> (2–3 business days) is available at checkout for $15.</p>
            <p><strong>Returns:</strong> 30-day free returns on unworn items with tags attached. Refunds are issued to the original payment method within 5–7 business days of receiving your return.</p>
            <p><strong>Order tracking:</strong> Sign in to your account to view live order status, or use the tracking link in your confirmation email.</p>
          </div>
        )}
        {topic === 'size-guide' && (
          <div className="space-y-6 text-sm leading-relaxed text-volt-graphite/90">
            <h2 className="display text-2xl">Size Guide</h2>
            <p>VOLTERRA products fit true to size unless noted on the product page. If you're between sizes, we recommend sizing up — especially for performance shoes with thick running socks.</p>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Footwear</h3>
            <div className="flex flex-wrap gap-2">
              {SHOE_SIZES.map((s) => (
                <span key={s} className="border border-volt-line px-3 py-1.5 text-xs font-semibold">{s}</span>
              ))}
            </div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Apparel</h3>
            <div className="flex flex-wrap gap-2">
              {APPAREL_SIZES.map((s) => (
                <span key={s} className="border border-volt-line px-3 py-1.5 text-xs font-semibold">{s}</span>
              ))}
            </div>
            <p>Tip: measure against a product you already own for the most accurate fit.</p>
          </div>
        )}
        {topic === 'contact' && (
          <div className="space-y-6 text-sm leading-relaxed text-volt-graphite/90">
            <h2 className="display text-2xl">Contact</h2>
            <p>Our team is available 7 days a week, 9:00–21:00 (EST).</p>
            <p><strong>Email:</strong> care@volterra.example</p>
            <p><strong>Phone:</strong> +1 (555) 010-2030</p>
            <p><strong>Live chat:</strong> available in demo mode via the search overlay on any page.</p>
          </div>
        )}
      </div>
    </div>
  )
}
