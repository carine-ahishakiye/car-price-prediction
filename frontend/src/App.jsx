import { useState, useEffect, useRef } from 'react'
import { useMeta, usePredict } from './hooks/usePredict'
import PredictionForm from './components/PredictionForm'
import ResultCard from './components/ResultCard'
import s from './App.module.css'

// Brand mark
const Logo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="38" rx="10" fill="url(#lg)" />
    <path d="M8 24l4-10h14l4 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="6" y="23" width="26" height="8" rx="3.5" fill="#fff" fillOpacity="0.12" stroke="#fff" strokeWidth="1.6" />
    <circle cx="13" cy="27" r="2.8" fill="#fff" />
    <circle cx="25" cy="27" r="2.8" fill="#fff" />
    <path d="M15 16h8" stroke="#bfdbfe" strokeWidth="1.6" strokeLinecap="round" />
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e3a8a" />
        <stop offset="1" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
  </svg>
)

// Static data
const BRANDS = ['Toyota', 'BMW', 'Ford', 'Mercedes-Benz', 'Honda', 'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Nissan']

const HOW_STEPS = [
  {
    n: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Enter vehicle details',
    desc: 'Brand, fuel type, transmission, production year, mileage, and engine displacement. Six fields. Thirty seconds.',
  },
  {
    n: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
      </svg>
    ),
    title: 'Model runs in milliseconds',
    desc: 'Our Gradient Boosting Regressor cross-references your inputs against thousands of verified real-world listings instantly.',
  },
  {
    n: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Receive your honest valuation',
    desc: 'A precise market price with a realistic confidence band. No upsells, no callbacks, no hidden charges. Just the number.',
  },
]

const FEATURES = [
  {
    icon: '◈',
    title: 'Gradient Boosting, not guesswork',
    desc: 'A proper ML model trained on real listing data, not depreciation tables copied from a 2009 spreadsheet.',
  },
  {
    icon: '⚡',
    title: 'Under one second, every time',
    desc: 'No account. No verification email. No "your estimate is being prepared." Instant results, always.',
  },
  {
    icon: '◉',
    title: 'Confidence intervals, not false precision',
    desc: 'We show a realistic price band because the market has a range, not a single number. Honest uncertainty wins.',
  },
  {
    icon: '⊕',
    title: 'Zero data retention',
    desc: 'What you type stays in your browser session. Nothing is stored, logged, or sold. We have no interest in your data.',
  },
  {
    icon: '◎',
    title: 'All makes, all markets',
    desc: 'Every major brand, fuel type, and transmission class. One model. The full breadth of the used car market.',
  },
  {
    icon: '◬',
    title: 'Free, and no agenda',
    desc: 'No premium tier. No referral commissions. No dealer partnerships. AutoVal earns exactly nothing from your valuation.',
  },
]

const TESTIMONIALS = [
  {
    stars: 5,
    quote: 'I walked into the dealership quoting AutoVal\'s number. They came back within 4% of it. I\'ve never negotiated from a stronger position in my life.',
    name: 'Samuel M.',
    role: 'Private seller · Nairobi',
    initials: 'SM',
  },
  {
    stars: 5,
    quote: 'Finally a tool that skips the email-phone-firstborn registration wall. Type your details, get a number. Done. Why did it take this long?',
    name: 'Amina C.',
    role: 'Used car buyer · Lagos',
    initials: 'AC',
  },
  {
    stars: 4,
    quote: 'The confidence range is the killer feature. Every competitor gives you a single magic number. AutoVal shows you the band the market actually trades in. That\'s far more useful.',
    name: 'Tom K.',
    role: 'Auto reseller · Kigali',
    initials: 'TK',
  },
]

const PROCESS_ROWS = [
  { n: '01', title: 'Describe your vehicle', sub: 'Brand · fuel · transmission · year · mileage · engine' },
  { n: '02', title: 'Model processes 8 features', sub: 'Against thousands of real market transactions' },
  { n: '03', title: 'You receive an honest estimate', sub: 'Precise price with a realistic confidence range' },
  { n: '04', title: 'Negotiate from strength', sub: 'Data in hand, not hunches, not hope' },
]

// Animated counter
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0 = null
    const step = (ts) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

// Intersection observer
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// Particle background
function ParticleCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.4, a: Math.random() * 0.4 + 0.08,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      pts.forEach(p => {
        p.x = (p.x + p.vx + w) % w
        p.y = (p.y + p.vy + h) % h
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147,197,253,${p.a})`; ctx.fill()
      })
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
          ctx.strokeStyle = `rgba(147,197,253,${0.06 * (1 - d / 120)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} className={s.particleCanvas} />
}

// Cursor glow
function CursorGlow() {
  const ref = useRef(null)
  useEffect(() => {
    const move = e => { if (ref.current) ref.current.style.transform = `translate(${e.clientX - 240}px,${e.clientY - 240}px)` }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return <div ref={ref} className={s.cursorGlow} />
}

// App
export default function App() {
  const { meta, error: metaError } = useMeta()
  const { predict, result, loading, error, reset } = usePredict()
  const showResult = result || error

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [statsRef, statsInView] = useInView(0.3)
  const count5k = useCounter(5000, 1600, statsInView)
  const count92 = useCounter(92, 1400, statsInView)
  const countK = useCounter(12, 1200, statsInView)

  const scrollTo = id => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={s.root}>
      <CursorGlow />
      <ParticleCanvas />

      {/* Video background */}
      <div className={s.videoWrap}>
        <video className={s.video} autoPlay muted loop playsInline>
          <source src="https://www.pexels.com/download/video/14228182/" type="video/mp4" />
        </video>
        <div className={s.videoOverlay} />
      </div>

      {/* Navbar */}
      <nav className={`${s.nav} ${scrolled ? s.navScrolled : ''}`}>
        <div className={s.navInner}>
          <div className={s.logoWrap}>
            <Logo size={34} />
            <span className={s.logo}>Auto<em>Val</em></span>
          </div>

          <ul className={s.navLinks}>
            {[['how', 'How It Works'], ['valuator', 'Valuator'], ['why', 'Why AutoVal'], ['testimonials', 'Reviews']].map(([id, label]) => (
              <li key={id}><button onClick={() => scrollTo(id)}>{label}</button></li>
            ))}
          </ul>

          <div className={s.navRight}>
            <span className={s.pill}><span className={s.pillDot} />ML-Powered</span>
            <button className={s.ctaBtnSmall} onClick={() => scrollTo('valuator')}>Get Valuation</button>
            <button className={s.burger} onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
              <span className={menuOpen ? s.burgerX1 : ''} />
              <span className={menuOpen ? s.burgerX2 : ''} />
              <span className={menuOpen ? s.burgerX3 : ''} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={s.mobileMenu}>
            {[['how', 'How It Works'], ['valuator', 'Valuator'], ['why', 'Why AutoVal'], ['testimonials', 'Reviews']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </div>
        )}
      </nav>

      <div className={s.page}>

        {/* HERO */}
        <section className={s.hero}>
          <div className={s.heroContent}>

            <div className={s.heroBadge}>
              <span className={s.liveDot} />
              Free Valuations · No Sign-Up Required
            </div>

            <h1 className={s.title}>
              Stop guessing what<br />
              your car is worth.
              <span className={s.titleSub}>Get the number dealers already know.</span>
            </h1>

            <p className={s.heroDesc}>
              AutoVal's machine-learning model, trained on over 5,000 real market transactions,
              delivers a precise, instant price estimate for any used vehicle. No agents.
              No appointments. No fine print.
            </p>

            <div className={s.heroCtas}>
              <button className={s.ctaBtn} onClick={() => scrollTo('valuator')}>
                <span className={s.ctaBtnInner}>
                  Value My Car - It's Free
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
                <span className={s.ctaBtnGlow} />
              </button>
              <button className={s.ctaBtnGhost} onClick={() => scrollTo('how')}>
                See how it works
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              </button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className={s.stats}>
              <div className={s.stat}>
                <strong>{statsInView ? count5k.toLocaleString() : '0'}+</strong>
                <span>Verified listings</span>
              </div>
              <span className={s.statDiv} />
              <div className={s.stat}>
                <strong>&lt; 1s</strong>
                <span>Response time</span>
              </div>
              <span className={s.statDiv} />
              <div className={s.stat}>
                <strong>{statsInView ? count92 : '0'}%</strong>
                <span>Model accuracy</span>
              </div>
              <span className={s.statDiv} />
              <div className={s.stat}>
                <strong>{statsInView ? countK : '0'}k+</strong>
                <span>Users this month</span>
              </div>
            </div>

            {/* Brand strip */}
            <div className={s.trustRow}>
              <span className={s.trustLabel}>All major brands covered</span>
              <div className={s.trustLogos}>
                {BRANDS.map(b => <span key={b} className={s.trustLogo}>{b}</span>)}
              </div>
            </div>
          </div>

          <button className={s.scrollCue} onClick={() => scrollTo('how')} aria-label="Scroll down">
            <span className={s.scrollMouse}><span className={s.scrollWheel} /></span>
          </button>
        </section>

        {/* PROBLEM BAND */}
        <div className={s.problemBand}>
          <div className={s.problemGlow} />
          <div className={s.problemInner}>
            <div className={s.problemText}>
              <p className={s.eyebrow}>The Problem</p>
              <h2 className={s.problemTitle}>
                Dealers have always known<br />
                <em>what your car is worth.</em>
              </h2>
              <p>
                The gap between what you accept and what the market will actually pay, sometimes
                thousands of dollars, is where dealer margin lives. AutoVal closes that gap.
                We trained a production ML model on real listing data so you negotiate from fact,
                not from hope.
              </p>
              <p>
                No more accepting a lowball offer because it sounds plausible.
                No more leaving money on the table because you had no benchmark.
              </p>
            </div>

            <div className={s.processVisual}>
              {PROCESS_ROWS.map((row, i) => (
                <div key={row.n} className={s.processRow} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={s.processNum}>{row.n}</div>
                  <div className={s.processRowText}>
                    <strong>{row.title}</strong>
                    <span>{row.sub}</span>
                  </div>
                  <span className={s.processArrow}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section id="how" className={s.section}>
          <p className={s.eyebrow}>The Process</p>
          <h2 className={s.sTitle}>
            Six inputs.<br />
            <span className={s.sTitleAccent}>One honest number.</span>
          </h2>
          <p className={s.sSub}>
            We believe simplicity is a form of respect for the user.
            You should not need a finance degree to value your own car.
          </p>

          <div className={s.steps}>
            {HOW_STEPS.map((step, i) => (
              <div key={step.n} className={s.stepCard} style={{ animationDelay: `${i * 0.14}s` }}>
                <div className={s.stepTop}>
                  <div className={s.stepIconWrap}>{step.icon}</div>
                  <span className={s.stepNum}>{step.n}</span>
                </div>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepDesc}>{step.desc}</p>
                <div className={s.stepBar} />
              </div>
            ))}
          </div>
        </section>

        {/* PULL QUOTE */}
        <div className={s.quoteBand}>
          <blockquote className={s.quote}>
            <span className={s.quoteMark}>"</span>
            <p>
              The best negotiation tool buyers and sellers have never had, until now.
              AutoVal gives private individuals the same market intelligence that dealerships
              have quietly kept to themselves for decades.
            </p>
            <footer>
              <div className={s.quoteLine} />
              <cite>The AutoVal Philosophy</cite>
              <div className={s.quoteLine} />
            </footer>
          </blockquote>
        </div>

        {/* VALUATOR */}
        <section id="valuator" className={s.section}>
          <p className={s.eyebrow}>Get Your Price</p>
          <h2 className={s.sTitle}>
            What is your car<br />
            <span className={s.sTitleAccent}>actually worth?</span>
          </h2>
          <p className={s.sSub}>
            Fill in the form below. The model does the rest in under a second.
          </p>

          {metaError && <p className={s.metaError}>⚠ {metaError}</p>}

          <div className={s.valOuter}>
            <div className={s.valCard}>
              <div className={s.valGlow} />

              <div className={s.valHeader}>
                <div className={s.valBadge}>
                  <span className={s.valBadgeDot} />
                  Free · Instant · No account needed
                </div>
                <h3 className={s.valTitle}>Tell us about your vehicle</h3>
                <p className={s.valSub}>
                  Every field sharpens precision. Garbage in, garbage out applies here too.
                </p>
              </div>

              <div className={s.valBody}>
                {showResult
                  ? <ResultCard result={result} error={error} onReset={reset} />
                  : <PredictionForm meta={meta} onSubmit={predict} loading={loading} />
                }
              </div>
            </div>

            {/* Trust sidebar */}
            <div className={s.valSidebar}>
              {[
                { icon: '◈', label: 'ML model', detail: 'Gradient Boosting Regressor' },
                { icon: '⊕', label: 'No data stored', detail: 'Session-only, never logged' },
                { icon: '⚡', label: 'Instant result', detail: 'Under 1 second every time' },
                { icon: '◎', label: 'Always free', detail: 'No premium tier or hidden fees' },
              ].map(item => (
                <div key={item.label} className={s.sidebarItem}>
                  <span className={s.sidebarIcon}>{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>
                </div>
              ))}

              <div className={s.sidebarDisclaimer}>
                Estimates are based on historical listing data and provided for reference only.
                Final transaction prices depend on condition, location, and market timing.
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className={s.section}>
          <p className={s.eyebrow}>From Our Users</p>
          <h2 className={s.sTitle}>
            Trusted by buyers and<br />
            <span className={s.sTitleAccent}>sellers across the continent.</span>
          </h2>
          <div className={s.testimonials}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={s.testiCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={s.testiGlow} />
                <div className={s.stars}>
                  {Array.from({ length: 5 }).map((_, si) => (
                    <span key={si} style={{ color: si < t.stars ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>★</span>
                  ))}
                </div>
                <p className={s.testiQuote}>"{t.quote}"</p>
                <div className={s.testiAuthor}>
                  <div className={s.testiAvatar}>{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY AUTOVAL */}
        <section id="why" className={s.section}>
          <p className={s.eyebrow}>Why AutoVal</p>
          <h2 className={s.sTitle}>
            Built for precision.<br />
            <span className={s.sTitleAccent}>Designed for trust.</span>
          </h2>
          <p className={s.sSub}>
            Six principles that separate AutoVal from every valuation tool that came before it.
          </p>
          <div className={s.features}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={s.featureCard} style={{ animationDelay: `${i * 0.07}s` }}>
                <span className={s.featIcon}>{f.icon}</span>
                <h3 className={s.featTitle}>{f.title}</h3>
                <p className={s.featDesc}>{f.desc}</p>
                <div className={s.featBar} />
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <div className={s.finalBand}>
          <div className={s.finalGlow} />
          <p className={s.eyebrow}>Get Started Today</p>
          <h2 className={s.finalTitle}>
            Ready to know exactly<br />what your car is worth?
          </h2>
          <p className={s.finalSub}>
            Join over 12,000 buyers and sellers who negotiate with data, not guesswork.
          </p>
          <button className={s.ctaBtn} onClick={() => scrollTo('valuator')}>
            <span className={s.ctaBtnInner}>
              Value My Car - It's Free
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
            <span className={s.ctaBtnGlow} />
          </button>
        </div>

        {/* FOOTER */}
        <footer className={s.footer}>
          <div className={s.footerBrand}>
            <div className={s.logoWrap}>
              <Logo size={26} />
              <span className={s.logo}>Auto<em>Val</em></span>
            </div>
            <p>Honest car valuations, powered by machine learning.</p>
            <p className={s.footerTag}>Made with precision. Free by principle.</p>
          </div>

          <nav className={s.footerNav}>
            <p className={s.footerNavLabel}>Navigation</p>
            {[['how', 'How It Works'], ['valuator', 'Valuator'], ['why', 'Why AutoVal'], ['testimonials', 'Reviews']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </nav>

          <div className={s.footerMeta}>
            <p className={s.footerNavLabel}>Technical</p>
            <span>FastAPI · React · scikit-learn</span>
            <span>Gradient Boosting Regressor</span>
            <span>For estimation purposes only</span>
            <span>Not financial advice</span>
          </div>

          <div className={s.footerLegal}>
            <span>© 2025 AutoVal. All rights reserved.</span>
          </div>
        </footer>

      </div>
    </div>
  )
}