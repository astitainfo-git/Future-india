import { useEffect, useRef, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import homeCss from './home.css?inline'

const IMG = '/images/home'
const PHONE = '+91-9680682068'
const TEL = 'tel:+919680682068'
const WHATSAPP = 'https://wa.me/919680682068'

/**
 * The home page is its own design (future-india-export-final.html), with its own header and
 * footer, so it renders outside the storefront layout. Its stylesheet sets global rules (body,
 * nav, section, .btn-primary) that would collide with the Molla theme, so while it is mounted the
 * theme stylesheets are switched off and this page's CSS is injected; both revert on leave.
 */
function usePageStyles() {
  useEffect(() => {
    const theme = [...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => l.href.includes('/assets/welcome/css/'))
    theme.forEach((l) => {
      l.disabled = true
    })

    // Its fonts (Dosis, Murecho) are linked in index.html so the first paint already has them.
    const style = document.createElement('style')
    style.textContent = homeCss
    document.head.append(style)

    const title = document.title
    document.title = 'Future India Export — Garment Manufacturer, Exporter & Wholesale Partner, Pushkar'

    return () => {
      style.remove()
      theme.forEach((l) => {
        l.disabled = false
      })
      document.title = title
    }
  }, [])
}

// .reveal / .reveal-stagger fade in once they scroll into view, as in the design's script.
function useReveal(root) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )
    root.current?.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [root])
}

function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > offset)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

const Icon = {
  clock: (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
  ),
  time: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>
  ),
}

const FEATURES = [
  ['clock', 'Since 1997', '25+ Years Experience'],
  ['globe', 'Exporting Worldwide', 'Across 6 Continents'],
  ['box', 'Low MOQ', 'Flexible for Startups'],
  ['tag', 'Private Label', 'Your Brand, Our Expertise'],
  ['gear', 'OEM & ODM', 'Custom Manufacturing'],
  ['heart', 'Ethical Production', 'Sustainable & Responsible'],
]

const TIERS = [
  { name: 'Starter', moq: 'MOQ 100 – 299 units', inr: '₹450', usd: '$5.40', items: ['White Label ready designs', 'Standard packing', '4–6 week turnaround'] },
  { name: 'Growth', moq: 'MOQ 300 – 999 units', inr: '₹380', usd: '$4.55', items: ['Private Label available', 'Custom packaging', '3–4 week turnaround'], featured: true },
  { name: 'Bulk', moq: 'MOQ 1000+ units', inr: '₹320', usd: '$3.85', items: ['Full OEM/ODM support', 'Dedicated account manager', 'Priority production slot'] },
]

const CATALOGUE = [
  ['cat1.jpg', "Women's", 'Wrap Dress', 'MOQ 100 units'],
  ['cat2.jpg', "Women's", 'Kimono Kaftan', 'MOQ 150 units'],
  ['cat3.jpg', "Men's", 'Block Print Shirt', 'MOQ 200 units'],
  ['cat4.jpg', "Women's", 'Co-ord Set', 'MOQ 100 units'],
]

const REVIEWS = [
  {
    title: 'Consistent quality, every single reorder',
    body: "We've placed six bulk orders with Future India Export now and every shipment has matched the sample exactly. Communication through production was clear the whole way, and our account manager flagged a fabric delay before we even had to ask.",
    name: 'Retail Buyer, West Coast Boutique Chain',
    loc: 'USA',
    date: 'Jun 2026',
  },
  {
    title: 'Made our first order easy to plan',
    body: "The tiered pricing meant we knew our landed cost before we even sent a tech pack. Sample turnaround was under a week, and the private label process was smoother than any supplier we'd worked with before.",
    name: 'Founder, Independent Label',
    loc: 'United Kingdom',
    date: 'Apr 2026',
  },
  {
    title: 'A supplier we keep coming back to',
    body: 'What stood out was how honest the team was about realistic timelines. The cotton quality on our block-print run was genuinely beautiful, and packing was careful enough that we had zero damage across the whole shipment.',
    name: 'Sourcing Manager, Fashion Import House',
    loc: 'Australia',
    date: 'Feb 2026',
  },
]

const FAQS = [
  ["White Label vs. Private Label — what's the difference?", 'White Label uses our ready, in-house designs with your branding added — faster, lower minimums. Private Label is built from your own designs or tech packs, manufactured exclusively for you.'],
  ['Which fabrics do you specialise in?', 'Primarily 100% natural cotton — including cambric, voile and organic cotton — along with silk and rayon on request.'],
  ['Do you work with startups and small brands?', 'Yes — we manufacture for emerging labels, online stores and established retailers alike, with low MOQ options.'],
  ['How do I start an order?', 'Call or WhatsApp us at +91-9680682068 with your requirements, and our team will guide you through the process.'],
]

const bg = (file) => ({ backgroundImage: `url("${IMG}/${file}")` })

const Caret = () => (
  <svg className="caret" width="10" height="6" viewBox="0 0 10 6"><path fill="currentColor" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708"></path></svg>
)

export default function Home() {
  const root = useRef(null)
  usePageStyles()
  useReveal(root)
  const scrolled = useScrolled()

  const [currency, setCurrency] = useState('INR')
  const [openFaq, setOpenFaq] = useState(0)
  const [newsletter, setNewsletter] = useState('')

  // The design's quote form was a demo alert with no email field, so a reply had no address
  // to go to. It opens WhatsApp with the details filled in: the channel the page already
  // gives for starting an order.
  const requestQuote = (event) => {
    event.preventDefault()
    const f = Object.fromEntries(new FormData(event.currentTarget))
    const text = [
      'Wholesale quote request',
      f.company && `Company: ${f.company}`,
      `Product: ${f.category}`,
      f.quantity && `Quantity: ${f.quantity}`,
      f.message && `Details: ${f.message}`,
    ]
      .filter(Boolean)
      .join('\n')
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  // Same newsletters table the PHP footer form wrote to.
  const subscribe = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    try {
      const { data } = await api.post('/newsletter', { email: new FormData(form).get('email') })
      form.reset()
      setNewsletter(data.message)
    } catch (err) {
      setNewsletter(errorMessage(err))
    }
  }

  const price = (tier) => (
    <div className="tier-price">
      <span className="amt">{currency === 'INR' ? tier.inr : tier.usd}</span>
      <span className="unit">/ unit</span>
    </div>
  )

  return (
    <div ref={root}>
      <div className="topbar">
        <div className="wrap">
          <div className="topbar-badges">
            <span>Ethically Manufactured Since 1997</span>
            <span>Wholesale Enquiries Always Open</span>
            <span>Ships to 6 Continents</span>
            <span>Sample Dispatch in 5–7 Days</span>
          </div>
          <div className="currency-toggle">
            {[['INR', '₹ INR'], ['USD', '$ USD']].map(([code, label]) => (
              <button key={code} className={currency === code ? 'active' : ''} onClick={() => setCurrency(code)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <nav style={{ boxShadow: scrolled ? '0 4px 16px -8px rgba(0,0,0,0.12)' : 'none' }}>
        <div className="wrap">
          <div className="brand">
            <div className="brand-mark filled" style={bg('logoMedia.jpg')}>
              <span className="logo-letters">FI</span>
            </div>
            <div>
              <div className="brand-name">Future India Export</div>
              <div className="brand-sub">Pushkar · Rajasthan</div>
            </div>
          </div>
          <div className="navlinks">
            <a href="#story">Our Story</a>
            <a href="#services">Services</a>
            <a href="#wholesale">Wholesale</a>
            <a href="#catalogue">Catalogue</a>
            <a href="#sustainability">Sustainability</a>
            <a href="#contact">Contact</a>
          </div>
          <a href="#wholesale" className="navcta">Request Quote</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-media upload-slot filled" style={bg('heroMedia.png')}></div>
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="eyebrow">Manufacturer · Exporter · Wholesale Partner</div>
            <h1>Your Trusted Garment Manufacturing &amp; Export Partner from India</h1>
            <p>We specialise in high-quality cotton, silk and rayon garments for fashion brands, retailers, wholesalers and importers worldwide — low MOQ production, private labeling, embroidery and printing.</p>
            <div className="hero-ctas">
              <a href="#wholesale" className="btn-primary">Request Wholesale Quote</a>
              <a href="#catalogue" className="btn-secondary">View Catalogue</a>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="wrap features-grid reveal-stagger">
          {FEATURES.map(([icon, text, sub]) => (
            <div className="feature-col" key={text}>
              <div className="feature-icon">{Icon[icon]}</div>
              <div className="feature-text">{text}</div>
              <div className="feature-sub">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="story" id="story">
        <div className="wrap story-grid">
          <div className="story-media upload-slot filled" style={bg('storyMedia.jpg')}></div>
          <div className="story-copy reveal">
            <div className="eyebrow" style={{ color: 'var(--muted)' }}>Our Story</div>
            <p className="lead">&quot;From raw cotton to a piece ready for your rack — we hold a brand&apos;s identity in cloth.&quot;</p>
            <p>Future India Export is a garment manufacturer and exporter based in Pushkar, Rajasthan, working in cotton, silk, natural cotton and rayon.</p>
            <p>Every order moves through our own cutting, stitching, embroidery, printing and quality-control floor — giving buyers one point of accountability from fabric to finished garment.</p>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="wrap">
          <div className="sec-head center reveal">
            <div className="eyebrow" style={{ textAlign: 'center' }}>Our Services</div>
            <h2>Two paths to bring your label to life</h2>
          </div>
          <div className="services-grid reveal-stagger">
            <div className="service-card">
              <div className="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></div>
              <h3>White Label</h3>
              <p>Rebrand our ready, high-quality collection as your own with complete customization.</p>
              <ul className="service-list">
                <li>Your brand, your identity</li>
                <li>Custom packaging design</li>
                <li>Fast turnaround time</li>
                <li>No minimum order quantity</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
              <h3>Private Label</h3>
              <p>Exclusive garments manufactured to your own tech packs and specifications.</p>
              <ul className="service-list">
                <li>Unique product formulations</li>
                <li>Complete brand ownership</li>
                <li>Quality assurance testing</li>
                <li>OEM &amp; ODM support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="wholesale" id="wholesale">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Wholesale / B2B Portal</div>
            <h2>Tiered pricing built for bulk buyers</h2>
            <p>Pricing scales down as order volume goes up. Every tier includes quality control, standard packing and export documentation.</p>
          </div>
          <div className="tier-grid reveal-stagger">
            {TIERS.map((tier) => (
              <div className={tier.featured ? 'tier-card featured' : 'tier-card'} key={tier.name}>
                <div className="tier-name">{tier.name}</div>
                <div className="tier-moq">{tier.moq}</div>
                {price(tier)}
                <ul className="tier-list">
                  {tier.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="quote-panel reveal">
            <div>
              <h3>Request a Custom Quote</h3>
              <p>Tell us your product, quantity and target price — our export team responds within 24 hours.</p>
              <div className="quote-contact-line">{Icon.phone}<span>{PHONE}</span></div>
              <div className="quote-contact-line">{Icon.pin}<span>Pushkar, Ajmer, Rajasthan</span></div>
              <div className="quote-contact-line">{Icon.time}<span>Mon–Sat, 9:00 AM – 6:00 PM IST</span></div>
            </div>
            <form className="qform" onSubmit={requestQuote}>
              <label htmlFor="q-company">Company Name</label>
              <input id="q-company" name="company" type="text" placeholder="Your company" />
              <label htmlFor="q-category">Product Category</label>
              <select id="q-category" name="category">
                <option>Women&apos;s Dresses</option>
                <option>Kimonos &amp; Jumpsuits</option>
                <option>Men&apos;s Shirts</option>
                <option>Co-ord Sets</option>
                <option>Other</option>
              </select>
              <label htmlFor="q-quantity">Quantity Required</label>
              <input id="q-quantity" name="quantity" type="number" min="1" placeholder="e.g. 500 units" />
              <label htmlFor="q-message">Message</label>
              <textarea id="q-message" name="message" placeholder="Fabric, colours, timeline..."></textarea>
              <button type="submit">Submit Quote Request</button>
            </form>
          </div>
        </div>
      </section>

      <section className="catalogue" id="catalogue">
        <div className="wrap">
          <div className="sec-head center reveal">
            <div className="eyebrow" style={{ textAlign: 'center' }}>Catalogue</div>
            <h2>Wholesale-ready designs</h2>
            <p>A snapshot of what&apos;s in production — full line sheet available on request.</p>
          </div>
          <div className="cat-grid reveal-stagger">
            {CATALOGUE.map(([file, kicker, title, moq]) => (
              <div className="cat-card" key={title}>
                <div className="cat-media upload-slot filled" style={bg(file)}></div>
                <div className="cat-body"><div className="cat-kicker">{kicker}</div><div className="cat-title">{title}</div><div className="cat-moq">{moq}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="coll-banners">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Shop by Fabric</div>
            <h2>Two ways buyers source with us</h2>
          </div>
          <div className="coll-grid reveal-stagger">
            <div className="coll-banner upload-slot filled" style={bg('bannerCotton.png')}>
              <div className="coll-banner-label"><div className="kicker">Bulk Ready</div><h3>Natural Cotton Range</h3></div>
            </div>
            <div className="coll-banner upload-slot filled" style={bg('bannerSilk.jpg')}>
              <div className="coll-banner-label"><div className="kicker">Private Label</div><h3>Silk &amp; Rayon Range</h3></div>
            </div>
          </div>
        </div>
      </section>

      <section className="infra" id="infrastructure">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Infrastructure</div>
            <h2>One roof, start to finish</h2>
            <p>Cutting, stitching, embroidery, printing, quality control and packing — all in-house, for fast and consistent turnaround.</p>
          </div>
          <div className="infra-grid reveal-stagger">
            <div className="cell upload-slot filled" style={bg('infra1.jpg')}></div>
            <div className="cell upload-slot filled" style={bg('infra2.png')}></div>
            <div className="cell upload-slot filled" style={bg('infra3.png')}></div>
          </div>
        </div>
      </section>

      <section className="sustain" id="sustainability">
        <div className="wrap sustain-grid">
          <div className="sustain-media upload-slot filled" style={bg('sustainMedia.jpg')}></div>
          <div className="reveal">
            <div className="eyebrow" style={{ color: 'var(--muted)' }}>Sustainability &amp; Trust</div>
            <h2>Responsible sourcing, verified process</h2>
            <p style={{ marginTop: '14px', fontSize: '15px', color: 'var(--ink-faint)' }}>Natural fibres, in-house quality control, and ethical production practices across every order — documented and available for buyer audits.</p>
            <div className="cert-row">
              <span className="cert-pill">{Icon.check}Quality Certified</span>
              <span className="cert-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>Ethical Production</span>
              <span className="cert-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>Export Certified</span>
            </div>
          </div>
        </div>
      </section>

      <section className="insta">
        <h2 className="reveal">Follow us on Instagram</h2>
        <p className="reveal">Stay connected and see our latest updates</p>
        <a href="https://www.instagram.com/laindiaimport/" className="insta-profile reveal" target="_blank" rel="noopener noreferrer">
          <div className="insta-icon"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg></div>
          <span>@laindiaimport</span>
        </a>
      </section>

      <section className="testimonials">
        <div className="wrap">
          <div className="sec-head center reveal">
            <div className="eyebrow" style={{ textAlign: 'center' }}>Buyer Reviews</div>
            <h2>Let our buyers speak for us</h2>
            <p className="review-count">from 340+ wholesale reorders</p>
          </div>
          <div className="test-grid reveal-stagger">
            {REVIEWS.map((r) => (
              <div className="test-card" key={r.title}>
                <div className="stars">★★★★★</div>
                <div className="test-title">{r.title}</div>
                <p className="body">{r.body}</p>
                <div className="test-meta"><div><div className="test-name">{r.name}</div><div className="test-loc">{r.loc}</div></div><div className="test-date">{r.date}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="locations" id="locations">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Visit Our Location</div>
            <h2>Find us at our workplace</h2>
          </div>
          <div className="loc-grid reveal-stagger">
            <div className="loc-card">
              <div className="loc-img upload-slot filled" style={bg('locMedia1.png')}></div>
              <div className="loc-body">
                <h3>Pushkar</h3>
                <div className="loc-line">{Icon.pin}<span>Future India Export, Pushkar, Ajmer District, Rajasthan, India</span></div>
                <div className="loc-line">{Icon.time}<span>Mon – Sat: 9:00 AM – 6:00 PM</span></div>
                <a href={TEL} className="loc-btn">Call {PHONE}</a>
              </div>
            </div>
            <div className="loc-card">
              <div className="loc-img upload-slot filled" style={bg('locMedia2.png')}></div>
              <div className="loc-body">
                <h3>Direct Contact</h3>
                <div className="loc-line">{Icon.phone}<span>{PHONE}</span></div>
                <div className="loc-line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.163c3.204 0 3.584.012 4.85.07"></path><circle cx="12" cy="12" r="4"></circle></svg><span>@laindiaimport</span></div>
                <a href={WHATSAPP} className="loc-btn" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="established">
        <h2>Future India Export</h2>
        <p>Established 1997</p>
      </section>

      <section className="faq">
        <h2>FAQ</h2>
        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <div className={openFaq === i ? 'faq-item open' : 'faq-item'} key={q}>
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                {q}
                <Caret />
              </div>
              <div className="faq-a"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact">
        <div className="wrap">
          <div className="foot-trust-row">
            <span>Wholesale Enquiries Always Open</span>
            <span>Sample Dispatch in 5–7 Days</span>
            <span>Export Documentation Handled</span>
            <span>Ethically Crafted, Pushkar</span>
          </div>
          <div className="newsletter">
            <h2>Subscribe to our emails</h2>
            <form onSubmit={subscribe}>
              <input type="email" name="email" placeholder="Email" required />
              <button type="submit" aria-label="Subscribe">→</button>
            </form>
            {newsletter && <p className="newsletter-msg">{newsletter}</p>}
          </div>
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="brand-name">Future India Export</div>
              <p>Cotton, silk and rayon garments, manufactured sustainably and ethically in Pushkar, Rajasthan for wholesale buyers worldwide.</p>
            </div>
            <div className="foot-cols">
              <div className="foot-links">
                <h5>Explore</h5>
                <a href="#story">Our Story</a>
                <a href="#wholesale">Wholesale Enquiry</a>
                <a href="#catalogue">Catalogue</a>
                <a href="#sustainability">Ethically Crafted</a>
              </div>
              <div className="foot-links">
                <h5>Contact</h5>
                <a href={TEL}>{PHONE}</a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
                <a href="#contact">Pushkar, Rajasthan</a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Future India Export.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
