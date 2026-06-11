'use client'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useInView,
  useAnimation,
} from 'motion/react'
import Link from 'next/link'
import {
  Zap, TrendingUp, Trophy, Layers, ArrowRight, BicepsFlexed,
  CheckCircle2, BarChart2, ChevronDown, Timer, RotateCcw,
  Share2, Download, Smartphone, Target, ShieldCheck, Flame, Dumbbell,
  HelpCircle, Scale,
} from 'lucide-react'

/* ─── Easing ──────────────────────────────────────────────── */
const E: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ─── Images (stock) — P1-6: fotos de rendimiento/fuerza ──── */
const IMGS = {
  // Hombre en barra — powerlifting / deadlift vibe
  hero:     '/screenshots/gym.jpg',
  // Atleta masculino con barra — sentadilla / fuerza
  records:  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1000&q=80',
  // TODO P1-6: reemplazar progreso por foto de atleta serio en peso muerto o press banca
  progreso: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80',
  // Gym vacío, peso muerto
  gym:      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
}

/* ─── Line reveal ────────────────────────────────────────── */
function LineReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        initial={reduce ? false : { y: '105%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.88, delay, ease: E }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ─── Fade-up reveal ─────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay, ease: E }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Animated counter ───────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!inView) return
    if (reduce) { setVal(to); return }
    let raf: number
    const start = performance.now()
    const dur = 1600
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 4)
      setVal(Math.round(ease * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, reduce])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ─── HeatmapTexture — brand identity motif ─────────────────
   SVG heatmap grid. Pseudo-random seed for consistency.
   Use as decorative background: opacity 0.06–0.18.
────────────────────────────────────────────────────────────── */
function HeatmapTexture({ cols = 52, rows = 7 }: { cols?: number; rows?: number }) {
  const cells: { c: number; r: number; lvl: number }[] = []
  let seed = 0x4b7a9c3e
  const rand = () => {
    seed = ((seed * 1664525 + 1013904223) | 0) >>> 0
    return seed / 0xffffffff
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const v = rand()
      const lvl = v < 0.52 ? 0 : v < 0.70 ? 1 : v < 0.83 ? 2 : v < 0.93 ? 3 : 4
      if (lvl > 0) cells.push({ c, r, lvl })
    }
  }
  const fills = ['', 'rgba(45,127,173,0.2)', 'rgba(45,127,173,0.38)', 'rgba(45,127,173,0.58)', 'rgba(45,127,173,0.80)']
  const W = cols * 15
  const H = rows * 15
  return (
    <svg width={W} height={H} aria-hidden="true" style={{ display: 'block' }}>
      {cells.map(({ c, r, lvl }) => (
        <rect key={`${c}-${r}`} x={c * 15} y={r * 15} width={13} height={13} rx={2} fill={fills[lvl]} />
      ))}
    </svg>
  )
}

/* ─── SectionHeader — single column ─────────────────────────
   eyebrow (top) → title → thin divider → paragraph.
   Applies to: "Todo lo que necesitas", "Por qué VoltTrack", "FAQ"
────────────────────────────────────────────────────────────── */
function SectionHeader({
  title,
  eyebrow,
  description,
}: {
  title: React.ReactNode
  eyebrow?: string
  description?: string
}) {
  return (
    <div style={{ marginBottom: '56px' }}>
      {eyebrow && (
        <Reveal>
          <p style={{
            fontSize: '11px',
            fontWeight: '500',
            color: '#2d7fad',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0 0 16px',
            lineHeight: '1',
          }}>
            {eyebrow}
          </p>
        </Reveal>
      )}
      <LineReveal>
        <h2 style={{
          fontSize: 'clamp(34px, 4.8vw, 62px)',
          fontWeight: '700',
          color: '#111318',
          letterSpacing: '-0.038em',
          lineHeight: '1.03',
          margin: 0,
        }}>
          {title}
        </h2>
      </LineReveal>
      {description && (
        <Reveal delay={0.1}>
          <div style={{ height: '1px', backgroundColor: '#eceef2', margin: '22px 0 18px', maxWidth: '500px' }} />
          <p style={{
            fontSize: 'clamp(15px, 1.4vw, 17px)',
            color: '#4a5057',
            lineHeight: '1.72',
            fontWeight: '300',
            margin: 0,
            maxWidth: '540px',
          }}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}

/* ─── Magnetic CTA ───────────────────────────────────────── */
function MagneticCTA({ href, children, primary = false, className = '' }: { href: string; children: React.ReactNode; primary?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0); const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 16 })
  const sy = useSpring(my, { stiffness: 180, damping: 16 })
  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduce ? { display: 'inline-block' } : { x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={(e) => {
        if (reduce || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.3)
        my.set((e.clientY - (r.top + r.height / 2)) * 0.3)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      whileTap={{ scale: 0.97 }}
    >
      <Link href={href}
        style={primary ? {
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#2d7fad', color: '#ffffff',
          textDecoration: 'none', padding: '14px 26px', borderRadius: '9px',
          fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em',
          transition: 'background-color 0.14s, box-shadow 0.2s',
        } : {
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'transparent', color: '#111318',
          textDecoration: 'none', padding: '14px 24px', borderRadius: '9px',
          fontSize: '15px', fontWeight: '500',
          border: '1px solid #dde0e6',
          transition: 'background-color 0.14s, border-color 0.14s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = primary ? '#246a94' : '#f5f6f8'
          if (!primary) e.currentTarget.style.borderColor = '#c4c9d1'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = primary ? '#2d7fad' : 'transparent'
          if (!primary) e.currentTarget.style.borderColor = '#dde0e6'
        }}
      >
        {children}
      </Link>
    </motion.div>
  )
}

/* ─── Nav ─────────────────────────────────────────────────── */
function Nav() {
  const { scrollY } = useScroll()
  const bg     = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.96)'])
  const border = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.07)'])
  return (
    <motion.header style={{ backgroundColor: bg, borderBottom: '1px solid', borderColor: border }} className="land-nav">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <motion.div
          style={{ backgroundColor: '#2d7fad', borderRadius: '7px', padding: '6px', display: 'flex' }}
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }}
          transition={{ duration: 0.4 }}
        >
          <Zap style={{ width: '13px', height: '13px', color: '#ffffff' }} />
        </motion.div>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111318', letterSpacing: '-0.01em' }}>VoltTrack</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/login" style={{ fontSize: '14px', fontWeight: '500', color: '#4a5057', textDecoration: 'none', padding: '8px 14px', borderRadius: '7px', transition: 'color 0.14s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111318')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a5057')}
        >
          Iniciar sesión
        </Link>
        <Link href="/registro" style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', textDecoration: 'none', padding: '8px 16px', borderRadius: '7px', backgroundColor: '#2d7fad', transition: 'background-color 0.14s' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#246a94')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2d7fad')}
        >
          Registrarse
        </Link>
      </div>
    </motion.header>
  )
}

/* ─── P0-1: ProductShot component ────────────────────────── */
function ProductShot({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const reduce = useReducedMotion()
  const controls = useAnimation()
  const tapping = useRef(false)

  // Start idle float once entry animation completes
  const startFloat = () => {
    if (reduce) return
    controls.start({
      y: [0, -10, 0],
      scale: 1,
      transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
    })
  }

  // Tap: lift → hold briefly → return, then resume float
  const handleTap = async () => {
    if (reduce || tapping.current) return
    tapping.current = true
    controls.stop()
    await controls.start({ y: -18, scale: 1.04, transition: { duration: 0.26, ease: E } })
    await controls.start({ y: 0,   scale: 1,    transition: { duration: 0.52, ease: E } })
    tapping.current = false
    startFloat()
  }

  return (
    // Outer: scroll-triggered entry
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.93 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: E }}
      onAnimationComplete={startFloat}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      {/* Inner: float + desktop hover + mobile tap */}
      <motion.div
        animate={controls}
        whileHover={reduce ? {} : { y: -6, scale: 1.02, transition: { duration: 0.4, ease: E } }}
        onTap={handleTap}
        style={{
          position: 'relative',
          width: '260px',
          height: '564px',
          flexShrink: 0,
          borderRadius: '32px',
          backgroundColor: '#ffffff',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          cursor: 'default',
          touchAction: 'manipulation',
        }}
      >
        {/* Notch */}
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          width: '72px', height: '22px', backgroundColor: '#111318',
          borderRadius: '11px', zIndex: 3,
        }} />
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          style={{ objectFit: 'cover', objectPosition: 'top center' }}
        />
      </motion.div>
    </motion.div>
  )
}

/* ─── Floating achievement card ──────────────────────────── */
function AchievementCard({ icon, label, value, delay = 0, style = {}, className = '', small = false, floatOffset = 0 }: {
  icon: React.ReactNode; label: string; value: string; delay?: number; style?: React.CSSProperties; className?: string; small?: boolean; floatOffset?: number
}) {
  const reduce = useReducedMotion()
  // Outer div: handles entry animation + absolute positioning
  // Inner div: handles continuous idle float + hover
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: E }}
    >
      <motion.div
        animate={reduce ? {} : { y: [0, -8, 0] }}
        transition={{
          duration: 3.2 + floatOffset * 0.65,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 0.9 + floatOffset * 0.5,
        }}
        whileHover={{ scale: 1.04, y: -5 }}
        style={{
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: small ? '10px' : '12px',
          padding: small ? '7px 10px' : '12px 16px',
          display: 'flex', alignItems: 'center', gap: small ? '7px' : '10px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          cursor: 'default',
        }}
      >
        <div style={{ backgroundColor: 'rgba(45,127,173,0.1)', borderRadius: small ? '5px' : '8px', padding: small ? '5px' : '8px', display: 'flex', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: small ? '8px' : '10px', color: '#7a8290', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{label}</p>
          <p style={{ fontSize: small ? '11px' : '14px', fontWeight: '600', color: '#111318', margin: 0, letterSpacing: '-0.01em' }}>{value}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Hero ────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollY }        = useScroll()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY         = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const scrollOpacity = useTransform(scrollY, [0, 220], [1, 0])
  const reduce = useReducedMotion()

  const [mouse, setMouse] = useState({ x: 50, y: 50 })
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  return (
    <section ref={ref} className="land-hero" onMouseMove={reduce ? undefined : handleMouseMove}>
      {!reduce && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(700px circle at ${mouse.x}% ${mouse.y}%, rgba(45,127,173,0.04) 0%, transparent 65%)`,
          transition: 'background 0.06s ease',
        }} />
      )}

      {/* Left content */}
      <div className="land-hero-left" style={{ position: 'relative', zIndex: 1 }}>
        {/* Identity: heatmap motif bottom-right */}
        <div style={{ position: 'absolute', bottom: '20px', right: '-20px', opacity: 0.12, pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
          <HeatmapTexture cols={14} rows={5} />
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: E }}
          className="hero-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#e8f3fb', border: '1px solid rgba(45,127,173,0.2)', borderRadius: '99px', padding: '5px 12px', marginBottom: '20px', alignSelf: 'flex-start' }}
        >
          <div className="hero-eyebrow-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2d7fad' }} />
          <span className="hero-eyebrow-text" style={{ fontSize: '11px', fontWeight: '600', color: '#2d7fad', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gym Performance Tracker</span>
        </motion.div>

        <div style={{ overflow: 'hidden', paddingBottom: '6px' }}>
          <motion.h1 className="land-h1 land-h1-main" initial={reduce ? false : { y: '105%' }} animate={{ y: '0%' }} transition={{ duration: 1.0, delay: 0.1, ease: E }}>
            Entrena con
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: '20px', paddingBottom: '6px' }}>
          <motion.h1 className="land-h1 land-h1-accent" style={{ color: '#2d7fad' }} initial={reduce ? false : { y: '105%' }} animate={{ y: '0%' }} transition={{ duration: 1.0, delay: 0.22, ease: E }}>
            intención.
          </motion.h1>
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: E }}
          className="land-sub"
        >
          Registra cada serie, calcula tus PRs automáticamente y visualiza 365 días de progreso — todo sin distracciones. Solo tú y tus números.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.64, ease: E }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}
        >
          <MagneticCTA href="/registro" primary>
            Crear cuenta gratis <ArrowRight style={{ width: '16px', height: '16px' }} />
          </MagneticCTA>
          <MagneticCTA href="/login" className="hero-cta-secondary">
            Iniciar sesión
          </MagneticCTA>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.84, ease: E }}
          className="hero-trust-row"
          style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}
        >
          {[
            { icon: ShieldCheck, text: 'Gratis para siempre' },
            { icon: Target,      text: 'Sin límite de rutinas' },
            { icon: Flame,       text: 'Sin anuncios' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <b.icon style={{ width: '13px', height: '13px', color: '#2d7fad', opacity: 0.5 }} />
              <span style={{ fontSize: '12px', color: '#7a8290', fontWeight: '400' }}>{b.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Mobile achievement cards — shown inline after trust badges on mobile */}
        <div className="hero-cards-mobile-wrap">
          <AchievementCard small icon={<Trophy style={{ width: '11px', height: '11px', color: '#c07040' }} />} label="Nuevo PR" value="Press banca · 130 kg" delay={1.1} floatOffset={0} style={{}} />
          <AchievementCard small icon={<Flame style={{ width: '11px', height: '11px', color: '#e06030' }} />} label="Racha activa" value="18 días seguidos 🔥" delay={1.3} floatOffset={1} style={{}} />
        </div>

        {/* Scroll indicator */}
        <motion.div className="hero-scroll-indicator" style={{ opacity: scrollOpacity, marginTop: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '34px', height: '34px', flexShrink: 0 }}>
            <motion.div
              animate={reduce ? {} : { scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(45,127,173,0.25)' }}
            />
            <motion.div
              animate={reduce ? {} : { y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(45,127,173,0.06)', borderRadius: '50%', border: '1px solid rgba(45,127,173,0.15)' }}
            >
              <ChevronDown style={{ width: '15px', height: '15px', color: '#2d7fad' }} />
            </motion.div>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(45,127,173,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Desliza para explorar
          </span>
        </motion.div>
      </div>

      {/* Right: gym image + floating cards — P1-4 priority image */}
      <div className="land-hero-right" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-desktop-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.4) 14%, transparent 28%), linear-gradient(to top, rgba(255,255,255,0.35) 0%, transparent 22%)' }} />
        <div className="hero-dark-overlay" aria-hidden="true" />
        <motion.div
          style={{ position: 'absolute', inset: '0 0 -28% 0', y: reduce ? 0 : imgY }}
          initial={reduce ? false : { scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: E }}
        >
          <Image
            src={IMGS.hero}
            alt="Atleta entrenando en el gimnasio"
            fill
            unoptimized
            style={{ objectFit: 'cover', objectPosition: '50% 0%' }}
            priority
          />
        </motion.div>
        {/* Desktop: cards absolutely positioned around the image */}
        <div className="hero-cards-desktop">
          <AchievementCard icon={<Trophy style={{ width: '14px', height: '14px', color: '#c07040' }} />} label="Nuevo PR" value="Press banca · 130 kg" delay={1.1} floatOffset={0} style={{ position: 'absolute', top: '22%', right: '8%' }} />
          <AchievementCard icon={<Flame style={{ width: '14px', height: '14px', color: '#e06030' }} />} label="Racha activa" value="18 días seguidos 🔥" delay={1.35} floatOffset={1} style={{ position: 'absolute', top: '44%', right: '14%' }} />
          <AchievementCard icon={<TrendingUp style={{ width: '14px', height: '14px', color: '#2e9a60' }} />} label="Progreso mensual" value="+12 kg en sentadilla" delay={1.6} floatOffset={2} style={{ position: 'absolute', bottom: '24%', right: '7%' }} />
        </div>
      </div>
    </section>
  )
}

/* ─── Marquee strip ───────────────────────────────────────── */
function MarqueeStrip() {
  const items = [
    { icon: BicepsFlexed, text: 'Series dinámicas' },
    { icon: Trophy,       text: 'PRs automáticos' },
    { icon: Zap,          text: '1RM estimado' },
    { icon: TrendingUp,   text: 'Progreso visual' },
    { icon: Scale,        text: 'Peso corporal' },
    { icon: Flame,        text: 'Racha activa' },
    { icon: BarChart2,    text: 'Dashboard 365 días' },
    { icon: RotateCcw,    text: 'Repite sesiones' },
    { icon: CheckCircle2, text: 'Rutinas por día' },
    { icon: Timer,        text: 'Timer de descanso' },
    { icon: Layers,       text: 'Historial completo' },
    { icon: Download,     text: 'Exporta a CSV' },
    { icon: Share2,       text: 'Comparte tus PRs' },
  ]
  return (
    <div style={{ backgroundColor: '#f8f9fb', borderTop: '1px solid #eceef2', borderBottom: '1px solid #eceef2', overflow: 'hidden', padding: '14px 0' }}>
      <div className="land-marquee">
        {[...items, ...items].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 36px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <Icon style={{ width: '12px', height: '12px', color: '#2d7fad', opacity: 0.5 }} />
              <span style={{ fontSize: '11px', color: '#9aa0a8', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Features grid ───────────────────────────────────────── */
function FeaturesGrid() {
  const features = [
    { icon: BicepsFlexed, title: 'Series dinámicas',  body: 'Agrega o elimina series en tiempo real. La última se copia automáticamente.' },
    { icon: RotateCcw,    title: 'Repite sesiones',   body: 'Carga la plantilla de tu última sesión con un solo toque. Sin reescribir.' },
    { icon: Trophy,       title: 'PRs automáticos',   body: 'Tu récord personal se actualiza solo. También calcula tu 1RM estimado.' },
    { icon: BarChart2,    title: 'Dashboard visual',  body: 'Heatmap de 365 días, gráfica de progreso por ejercicio y volumen semanal.' },
    { icon: Target,       title: 'RIR por serie',     body: 'Controla la intensidad con Reps In Reserve en cada serie.' },
    { icon: Smartphone,   title: 'Optimizado móvil',  body: 'Diseñado para usarlo desde el teléfono en el gym. Rápido y táctil.' },
  ]
  return (
    <section style={{ position: 'relative', backgroundColor: '#f8f9fb', padding: 'clamp(64px,8vw,100px) clamp(24px,5vw,80px)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(45,127,173,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
        <SectionHeader
          title={<>Todo lo que<br />necesitas.</>}
          eyebrow="6 funciones · 0 fricciones"
          description="Cada función fue diseñada para eliminar una fricción real que los atletas tienen cuando registran su entrenamiento."
        />
        <div className="land-features-grid">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={Math.floor(i / 3) * 0.05 + (i % 3) * 0.03}>
                <motion.div
                  className="land-feature-card"
                  whileHover={{ y: -3, borderColor: '#dde0e6' }}
                  transition={{ duration: 0.2, ease: E }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1, ease: E }}
                    style={{ height: '1px', backgroundColor: '#dde0e6', marginBottom: '24px', transformOrigin: 'left' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ backgroundColor: '#e8f3fb', border: '1px solid rgba(45,127,173,0.15)', borderRadius: '9px', padding: '9px', display: 'flex', flexShrink: 0 }}>
                      <Icon style={{ width: '15px', height: '15px', color: '#2d7fad' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#c4c9d1', fontWeight: '600', fontVariantNumeric: 'tabular-nums', paddingTop: '2px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111318', letterSpacing: '-0.02em', margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: '#7a8290', margin: 0, lineHeight: '1.65', fontWeight: '300' }}>{f.body}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── P0-1 + P0-2: Product showcase (reemplaza FeatureEditorial + FeatureSplit) ── */
// Secciones alternadas: texto izquierda/derecha + ProductShot
function ProductShowcase() {
  const sections = [
    {
      tag: 'Registro de sesiones',
      Icon: BicepsFlexed,
      title: 'El gym en tu bolsillo.',
      body: 'Selecciona la rutina del día y los pesos de tu última sesión aparecen como referencia. Solo actualiza lo que cambió y guarda en un clic.',
      bullets: ['Series +/– en tiempo real', 'Referencia automática del último peso', 'Notas por serie'],
      shot: '/screenshots/registro2.jpeg',
      shotAlt: 'Pantalla de registro de sesión en VoltTrack',
      reverse: false,
    },
    {
      tag: 'Récords automáticos',
      Icon: Trophy,
      title: 'Tu PR se actualiza solo.',
      // Dashboard más prominente — el más vendedor
      body: 'Cada vez que superas tu peso máximo, VoltTrack lo detecta y registra el nuevo PR al instante. También calcula tu 1RM estimado con la fórmula Epley.',
      bullets: ['1RM calculado automáticamente', 'Ranking de ejercicios por fuerza', 'Comparte tu PR en un clic'],
      shot: '/screenshots/records2.jpg',
      shotAlt: 'Pantalla de récords personales en VoltTrack',
      reverse: true,
    },
    {
      tag: 'Dashboard',
      Icon: BarChart2,
      // Dashboard es lo más vendedor — sección más prominente
      title: '365 días de progreso\nen una pantalla.',
      body: 'Heatmap de actividad al estilo GitHub, curva de evolución de fuerza por ejercicio, racha de días activos y volumen semanal acumulado.',
      bullets: ['Heatmap anual de actividad', 'Racha de días consecutivos', 'Volumen semanal vs semana anterior'],
      shot: '/screenshots/dashboard2.jpg',
      shotAlt: 'Dashboard de VoltTrack con heatmap y gráficas de progreso',
      reverse: false,
    },
  ]

  return (
    <>
      {sections.map((s, idx) => (
        <section
          key={s.tag}
          style={{
            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fb',
            borderTop: '1px solid #eceef2',
            padding: 'clamp(64px,8vw,100px) clamp(24px,5vw,80px)',
          }}
        >
          <div style={{
            maxWidth: '1100px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: s.reverse ? '1fr 1fr' : '1fr 1fr',
            gap: 'clamp(40px,6vw,80px)',
            alignItems: 'center',
          }} className={s.reverse ? 'showcase-row showcase-row--rev' : 'showcase-row'}>

            {/* Text */}
            <div className="showcase-text">
              <Reveal>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#e8f3fb', border: '1px solid rgba(45,127,173,0.2)', borderRadius: '99px', padding: '4px 12px', marginBottom: '20px' }}>
                  <s.Icon style={{ width: '12px', height: '12px', color: '#2d7fad' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#2d7fad', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.tag}</span>
                </div>
              </Reveal>
              <LineReveal delay={0.04}>
                <h2 style={{ fontSize: 'clamp(28px, 3.6vw, 48px)', fontWeight: '700', color: '#111318', letterSpacing: '-0.035em', lineHeight: '1.06', margin: '0 0 16px', whiteSpace: 'pre-line' }}>
                  {s.title}
                </h2>
              </LineReveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize: '16px', color: '#7a8290', margin: '0 0 24px', lineHeight: '1.7', fontWeight: '300', maxWidth: '420px' }}>
                  {s.body}
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {s.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2d7fad', flexShrink: 0, opacity: 0.7 }} />
                      <span style={{ fontSize: '14px', color: '#4a5057', fontWeight: '400' }}>{b}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* ProductShot — sin opacity:0 inicial para evitar bug whileInView en desktop */}
            <div className="showcase-shot-wrap">
              <ProductShot src={s.shot} alt={s.shotAlt} />
            </div>
          </div>
        </section>
      ))}
    </>
  )
}


/* ─── P0-2: WhySection — dark section, 3 razones ──────────── */
function WhySection() {
  const reasons = [
    {
      icon: ShieldCheck,
      stat: '100%',
      statLabel: 'gratis',
      title: 'Gratis para siempre',
      body: 'No hay plan premium, no hay funciones bloqueadas. Todo lo que ves es todo lo que hay — sin costo, sin sorpresas.',
    },
    {
      icon: Target,
      stat: '0',
      statLabel: 'distracciones',
      title: 'Cero distracciones',
      body: 'Sin feed social, sin notificaciones innecesarias. Entras al gym, registras tu sesión, sales. Así de simple.',
    },
    {
      icon: Download,
      stat: '∞',
      statLabel: 'control',
      title: 'Tus datos son tuyos',
      body: 'Exporta todo tu historial en CSV en cualquier momento. Sin bloqueos ni suscripción requerida.',
    },
  ]
  const reduce = useReducedMotion()
  return (
    <section style={{ backgroundColor: '#0d1117', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(48px,7vw,72px)' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(91,163,204,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 18px' }}>
            Por qué VoltTrack
          </p>
          <h2 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: '700', color: '#f0f2f5', letterSpacing: '-0.03em', lineHeight: '1.05', margin: '0 0 20px' }}>
            Sin planes. Sin anuncios.<br />Sin excusas.
          </h2>
          <p style={{ fontSize: 'clamp(14px,1.4vw,16px)', color: '#8a9199', margin: 0, maxWidth: '560px', lineHeight: '1.7', fontWeight: '300' }}>
            La mayoría de apps de gym son complicadas o te muestran anuncios mientras intentas concentrarte. VoltTrack no hace ninguna de esas cosas.
          </p>
        </div>

        {/* 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', borderRadius: '18px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }} className="why-grid">
          {reasons.map((r, i) => {
            const Icon = r.icon
            return (
              <Reveal key={r.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ backgroundColor: '#161c26' }}
                  transition={{ duration: 0.2 }}
                  style={{ backgroundColor: '#111318', padding: 'clamp(32px,4vw,52px) clamp(28px,3.5vw,44px)', height: '100%', boxSizing: 'border-box', position: 'relative' }}
                >
                  {/* Top accent line */}
                  <motion.div
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08 + 0.1, ease: E }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', backgroundColor: '#2d7fad', transformOrigin: 'left', opacity: 0.5 }}
                  />

                  {/* Big stat */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: 'clamp(42px,5vw,64px)', fontWeight: '700', color: '#2d7fad', letterSpacing: '-0.04em', lineHeight: 1 }}>{r.stat}</span>
                      <span style={{ fontSize: '13px', color: 'rgba(45,127,173,0.6)', fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.statLabel}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 6, scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                    style={{ backgroundColor: 'rgba(45,127,173,0.12)', border: '1px solid rgba(45,127,173,0.2)', borderRadius: '10px', padding: '10px', display: 'inline-flex', marginBottom: '18px' }}
                  >
                    <Icon style={{ width: '18px', height: '18px', color: '#5ba3cc' }} />
                  </motion.div>

                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f0f2f5', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: '1.25' }}>{r.title}</h3>
                  <p style={{ fontSize: '14px', color: '#8a9199', margin: 0, lineHeight: '1.75', fontWeight: '300' }}>{r.body}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── P2-9: FAQ section ───────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const items = [
    {
      q: '¿De verdad es gratis? ¿Cuál es la trampa?',
      a: 'La construí para mí y decidí abrirla gratis. No hay plan premium, no hay funciones bloqueadas, no hay anuncios. Todo lo que ves es todo lo que hay.',
    },
    {
      q: '¿Necesito instalar algo?',
      a: 'No. La abrí desde el navegador del teléfono desde el primer día. Si quieres el ícono en la pantalla de inicio, puedes instalarla como PWA desde Chrome o Safari con un toque, sin pasar por ninguna tienda.',
    },
    {
      q: '¿Dónde se guardan mis datos?',
      a: 'En Supabase, que corre sobre infraestructura AWS. Tus sesiones son tuyas: ningún otro usuario puede verlas y yo tampoco las uso para nada.',
    },
    {
      q: '¿Funciona sin conexión?',
      a: 'Parcialmente. La app carga desde caché si ya la abriste antes. Para guardar una sesión necesitas conexión. Modo offline completo es algo que quiero resolver, está en el roadmap.',
    },
    {
      q: '¿Puedo exportar mis datos?',
      a: 'Sí, desde Perfil puedes descargar todo tu historial en CSV cuando quieras. Sin suscripción, sin formularios, sin fricción.',
    },
  ]

  return (
    <section style={{ backgroundColor: '#ffffff', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', borderTop: '1px solid #eceef2' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <SectionHeader
          title="Preguntas frecuentes."
          eyebrow="5 respuestas directas"
          description="Lo que más nos preguntan antes de crear una cuenta, respondido sin rodeos."
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div style={{ borderTop: i === 0 ? '1px solid #eceef2' : undefined }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 0', background: 'none', border: 'none', borderBottom: '1px solid #eceef2',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: '16px',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#111318', letterSpacing: '-0.01em', lineHeight: '1.4' }}>{item.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.22, ease: E }}
                    style={{ flexShrink: 0 }}
                  >
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#9aa0a8' }} />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.25, ease: E }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ fontSize: '14px', color: '#7a8290', lineHeight: '1.7', fontWeight: '300', padding: '12px 0 20px', margin: 0 }}>
                    {item.a}
                  </p>
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: '68vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        src={IMGS.gym}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center 40%', opacity: 0.22 }}
        loading="lazy"
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(10,14,26,0.97) 0%, rgba(8,14,28,0.94) 100%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(45,127,173,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', textAlign: 'center', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', maxWidth: '760px' }}>
        <LineReveal>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.04em', lineHeight: '1.02', margin: '0 0 16px', textWrap: 'balance' } as React.CSSProperties}>
            Tu próximo PR
          </h2>
        </LineReveal>
        <LineReveal delay={0.08}>
          <h2 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: '700', color: '#7ab8d4', letterSpacing: '-0.04em', lineHeight: '1.02', margin: '0 0 24px', textWrap: 'balance' } as React.CSSProperties}>
            empieza hoy.
          </h2>
        </LineReveal>
        <Reveal delay={0.15}>
          <p style={{ fontSize: '16px', color: '#6a7280', margin: '0 0 44px', fontWeight: '300', lineHeight: '1.6' }}>
            Gratis. Sin tarjeta. Sin límites de rutinas. Sin excusas.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#2d7fad', color: '#ffffff', textDecoration: 'none', padding: '14px 26px', borderRadius: '9px', fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em', transition: 'background-color 0.14s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#246a94')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2d7fad')}
              >
                Crear cuenta gratis <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.07)', color: '#e2e2e8', textDecoration: 'none', padding: '14px 24px', borderRadius: '9px', fontSize: '15px', fontWeight: '500', border: '1px solid rgba(255,255,255,0.12)', transition: 'background-color 0.14s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.11)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
              >
                Ya tengo cuenta
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Social SVGs ─────────────────────────────────────────── */
const SocialInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const SocialX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const SocialTikTok = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1.06-.09z"/>
  </svg>
)
const SocialYoutube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a0c10"/>
  </svg>
)

/* ─── P1-5: Solo scroll-to-top (WhatsApp eliminado) ──────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const reduce = useReducedMotion()
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const scrollTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8, pointerEvents: visible ? 'auto' : 'none' }}
      transition={{ duration: 0.2, ease: E }}
      onClick={scrollTop}
      aria-label="Volver arriba"
      style={{
        position: 'fixed', bottom: '28px', right: '24px', zIndex: 90,
        width: '40px', height: '40px', borderRadius: '50%',
        backgroundColor: '#ffffff', color: '#4a5057',
        border: '1px solid #dde0e6',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderColor: '#c4c9d1' }}
      whileTap={{ scale: 0.95 }}
    >
      <ChevronDown style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
    </motion.button>
  )
}

/* ─── Footer ──────────────────────────────────────────────── */
function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)
  const handleNewsletter = (e: React.FormEvent) => { e.preventDefault(); if (email) setSent(true) }

  const col1 = [
    { label: 'Registrar sesión', href: '/progreso' },
    { label: 'Mis rutinas',      href: '/rutinas' },
    { label: 'Dashboard',        href: '/dashboard' },
    { label: 'Historial',        href: '/historial' },
    { label: 'Récords (PRs)',    href: '/records' },
    { label: 'Peso corporal',    href: '/peso' },
  ]
  const col2 = [
    { label: 'Crear cuenta gratis', href: '/registro' },
    { label: 'Iniciar sesión',      href: '/login' },
  ]
  // Sin perfiles reales aún — iconos eliminados para no apuntar a homes genéricas
  const socials: { label: string; href: string; icon: React.ReactNode }[] = []
  const linkStyle: React.CSSProperties = { fontSize: '13px', color: '#6b7280', textDecoration: 'none', fontWeight: '400', transition: 'color 0.14s', display: 'block' }

  return (
    <footer style={{ backgroundColor: '#0d0f14', color: '#e2e2e8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(52px,7vw,80px) clamp(24px,5vw,80px) clamp(40px,5vw,56px)', display: 'grid', gap: '40px' }} className="footer-grid">
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ backgroundColor: '#2d7fad', borderRadius: '7px', padding: '6px', display: 'flex', flexShrink: 0 }}>
              <Zap style={{ width: '13px', height: '13px', color: '#ffffff' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em' }}>VoltTrack</span>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 24px', maxWidth: '260px', fontWeight: '300' }}>
            El tracker de entrenamiento para atletas serios. Registra pesos, sigue tus PRs y visualiza 365 días de progreso.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: '36px', height: '36px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'color 0.14s, border-color 0.14s, background-color 0.14s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
              >{s.icon}</a>
            ))}
          </div>
        </div>
        {/* App */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 18px' }}>App</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {col1.map(l => <a key={l.label} href={l.href} style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#e2e2e8')} onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>{l.label}</a>)}
          </div>
        </div>
        {/* Cuenta */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 18px' }}>Cuenta</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {col2.map(l => <a key={l.label} href={l.href} style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = '#e2e2e8')} onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>{l.label}</a>)}
          </div>
        </div>
        {/* Newsletter */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 10px' }}>Newsletter</p>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 16px', fontWeight: '300' }}>
            Novedades, tips de entrenamiento y actualizaciones de la app.
          </p>
          {sent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', backgroundColor: 'rgba(46,154,96,0.12)', border: '1px solid rgba(46,154,96,0.25)', borderRadius: '9px' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2e9a60', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#2e9a60', fontWeight: '500' }}>Suscrito correctamente</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu email" required
                style={{ flex: 1, padding: '10px 14px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#e2e2e8', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(45,127,173,0.5)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.09)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)' }}
              />
              <button type="submit" aria-label="Suscribirse"
                style={{ padding: '10px 14px', backgroundColor: '#2d7fad', border: '1px solid #2d7fad', borderRadius: '0 8px 8px 0', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background-color 0.14s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#246a94')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2d7fad')}
              >
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            </form>
          )}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '18px clamp(24px,5vw,80px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', maxWidth: '1200px', margin: '0 auto' }} className="footer-bottom">
        <p style={{ fontSize: '12px', color: '#3d4147', margin: 0 }}>© 2026 VoltTrack. Todos los derechos reservados.</p>
        <p style={{ fontSize: '12px', color: '#3d4147', margin: 0 }}>Gratis para siempre · Sin anuncios · Sin límites</p>
      </div>
    </footer>
  )
}

/* ─── CSS ─────────────────────────────────────────────────── */
const css = `
  .land-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px clamp(20px, 5vw, 60px);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  }
  .land-hero {
    display: grid;
    grid-template-columns: 52% 48%;
    min-height: 100dvh;
    background: #ffffff;
    overflow: hidden;
    position: relative;
  }
  .land-hero-left {
    display: flex; flex-direction: column; justify-content: center;
    padding: clamp(96px,11vw,130px) clamp(24px,5vw,80px) clamp(48px,6vw,72px);
    position: relative; z-index: 1;
  }
  .land-hero-right { position: relative; overflow: hidden; }
  .land-h1 {
    font-size: clamp(52px, 7.8vw, 90px);
    font-weight: 700; color: #111318;
    letter-spacing: -0.035em; line-height: 0.94; margin: 0; display: block;
  }
  .land-sub {
    font-size: clamp(15px, 1.6vw, 17px); color: #7a8290;
    line-height: 1.65; max-width: 420px; margin: 0 0 28px; font-weight: 300;
  }
  /* ── SectionHeader — single column ────────────────────── */
  /* Layout handled inline; no CSS grid needed */

  /* Product showcase row */
  .showcase-shot-wrap {
    display: flex;
    justify-content: center;
    padding: clamp(20px,3vw,40px) 0;
  }
  .showcase-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(40px,6vw,80px);
    align-items: center;
  }
  .showcase-row--rev .showcase-text { order: 2; }
  .showcase-row--rev > :last-child   { order: 1; }
  .land-features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background-color: #e0e3e7; border-radius: 14px; overflow: hidden;
  }
  .land-feature-card {
    background-color: #ffffff;
    padding: clamp(22px,3vw,32px) clamp(20px,2.5vw,28px);
    border: 1px solid transparent;
    transition: border-color 0.2s ease, background-color 0.2s ease; cursor: default;
  }
  .land-feature-card:hover { background-color: #f3f7fb; }
  .land-marquee { display: flex; width: max-content; animation: marquee 36s linear infinite; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .land-marquee:hover { animation-play-state: paused; }
  .why-grid { grid-template-columns: repeat(3, 1fr); }
  .footer-grid { grid-template-columns: 2fr 1fr 1fr 1.6fr; }
  @media (max-width: 900px) {
    .land-features-grid { grid-template-columns: repeat(2, 1fr); }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
    .why-grid { grid-template-columns: 1fr !important; }
  }
  /* Hero achievement cards */
  .hero-cards-desktop { display: contents; }
  /* Mobile wrapper hidden on desktop */
  .hero-cards-mobile-wrap { display: none; }
  /* Dark overlay: hidden on desktop, shown on mobile */
  .hero-dark-overlay { display: none; pointer-events: none; }
  /* Desktop gradient overlay: shown by default */
  .hero-desktop-overlay { display: block; }

  @media (max-width: 767px) {
    /* ── Hero: full-bleed photo background ─────────────────── */
    .land-hero {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      min-height: 100dvh;
    }
    /* Image panel becomes absolute full-bleed background */
    .land-hero-right {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 0;
      overflow: hidden !important;
    }
    /* Hide white desktop gradient, show dark mobile overlay */
    .hero-desktop-overlay { display: none; }
    .hero-dark-overlay {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 2;
      background:
        linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.15) 100%),
        rgba(0,0,0,0.08);
    }
    /* Text column: full height, content sits at bottom */
    .land-hero-left {
      position: relative;
      z-index: 10;
      padding: 88px 24px 48px;
      min-height: 100dvh;
      justify-content: flex-end;
    }
    /* Text colors on dark background */
    .land-h1 { font-size: clamp(42px, 11vw, 58px); }
    .land-h1-main { color: #ffffff !important; }
    .land-h1-accent { color: #5ab4e8 !important; }
    .land-sub { color: rgba(255,255,255,0.70) !important; }
    /* Eyebrow pill */
    .hero-eyebrow {
      background-color: rgba(255,255,255,0.12) !important;
      border-color: rgba(255,255,255,0.18) !important;
    }
    .hero-eyebrow-dot { background-color: rgba(255,255,255,0.65) !important; }
    .hero-eyebrow-text { color: rgba(255,255,255,0.80) !important; }
    /* Trust badges */
    .hero-trust-row span { color: rgba(255,255,255,0.50) !important; }
    .hero-trust-row svg { color: rgba(255,255,255,0.45) !important; }
    /* Secondary CTA on dark bg */
    .hero-cta-secondary a {
      color: rgba(255,255,255,0.88) !important;
      border-color: rgba(255,255,255,0.28) !important;
      background-color: rgba(255,255,255,0.08) !important;
    }
    /* Hide scroll indicator */
    .hero-scroll-indicator { display: none !important; }
    /* Achievement cards — fila inline bajo los trust badges */
    .hero-cards-desktop { display: none; }
    .hero-cards-mobile-wrap {
      display: flex;
      flex-direction: row;
      gap: 8px;
      margin-top: 20px;
      width: 100%;
    }
    .hero-cards-mobile-wrap > * {
      flex: 1;
      min-width: 0;
    }
    /* Other responsive rules */
    .showcase-row, .showcase-row--rev {
      grid-template-columns: 1fr !important;
    }
    .showcase-row--rev .showcase-text { order: 1 !important; }
    .showcase-row--rev > :last-child   { order: 2 !important; }
    .showcase-shot-wrap {
      transform: scale(0.82);
      transform-origin: center top;
      margin-bottom: -80px;
      padding: 0;
    }
    .land-features-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .footer-bottom { flex-direction: column; text-align: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .land-marquee { animation: none; }
  }
`

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ backgroundColor: '#ffffff', color: '#111318', minHeight: '100dvh', fontFamily: 'var(--font-lexend), system-ui, sans-serif' }}>
        <Nav />
        <Hero />
        <MarqueeStrip />
        <FeaturesGrid />
        <ProductShowcase />
        <WhySection />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}
