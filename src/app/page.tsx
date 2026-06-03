'use client'
import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useInView,
} from 'motion/react'
import Link from 'next/link'
import {
  Zap, TrendingUp, Trophy, Layers, ArrowRight, BicepsFlexed,
  CheckCircle2, BarChart2, ChevronDown, Timer, RotateCcw,
  Share2, Download, Smartphone, Target, ShieldCheck, Flame,
} from 'lucide-react'

/* ─── Easing ──────────────────────────────────────────────── */
const E: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ─── Images ──────────────────────────────────────────────── */
const IMGS = {
  hero:     'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85',
  registro: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85',
  records:  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1000&q=80',
  progreso: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80',
  gym:      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
}

/* ─── Text slide-up reveal ───────────────────────────────── */
function LineReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        initial={reduce ? false : { y: '105%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.9, delay, ease: E }}
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
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: E }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Animated counter ───────────────────────────────────── */
function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!inView) return
    if (reduce) { setVal(to); return }
    let raf: number
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, reduce])
  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

/* ─── Magnetic CTA ───────────────────────────────────────── */
function MagneticCTA({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 16 })
  const sy = useSpring(my, { stiffness: 180, damping: 16 })
  return (
    <motion.div
      ref={ref}
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
      <Link
        href={href}
        style={primary ? {
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#b1c9e1', color: '#0c0e12',
          textDecoration: 'none', padding: '13px 24px', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600', letterSpacing: '-0.01em',
          transition: 'background-color 0.14s',
        } : {
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.06)', color: '#e2e2e8',
          textDecoration: 'none', padding: '13px 22px', borderRadius: '8px',
          fontSize: '14px', fontWeight: '500',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'background-color 0.14s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = primary ? '#c4d6ea' : 'rgba(255,255,255,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = primary ? '#b1c9e1' : 'rgba(255,255,255,0.06)' }}
      >
        {children}
      </Link>
    </motion.div>
  )
}

/* ─── Nav ─────────────────────────────────────────────────── */
function Nav() {
  const { scrollY } = useScroll()
  const bg     = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(10,12,16,0.96)'])
  const border = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)'])
  return (
    <motion.header style={{ backgroundColor: bg, borderBottom: '1px solid', borderColor: border }} className="land-nav">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{ backgroundColor: '#b1c9e1', borderRadius: '7px', padding: '6px', display: 'flex' }}>
          <Zap style={{ width: '13px', height: '13px', color: '#0c0e12' }} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.01em' }}>VoltTrack</span>
      </Link>
      <div />
    </motion.header>
  )
}

/* ─── Scroll indicator ───────────────────────────────────── */
function ScrollIndicator() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 180], [1, 0])
  const reduce  = useReducedMotion()
  return (
    <motion.div
      style={{
        opacity,
        position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        zIndex: 10, pointerEvents: 'none',
      }}
    >
      <span style={{ fontSize: '10px', fontWeight: '500', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Desliza
      </span>
      <motion.div
        animate={reduce ? {} : { y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
      >
        <ChevronDown style={{ width: '18px', height: '18px', color: 'rgba(177,201,225,0.5)' }} />
      </motion.div>
    </motion.div>
  )
}

/* ─── Hero ────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY   = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const reduce = useReducedMotion()

  // Cursor spotlight
  const [mouse, setMouse] = useState({ x: 50, y: 50 })
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <section ref={ref} className="land-hero" onMouseMove={reduce ? undefined : handleMouseMove}>
      {/* Cursor spotlight — only on left panel */}
      {!reduce && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(177,201,225,0.04) 0%, transparent 60%)`,
          transition: 'background 0.08s ease',
        }} />
      )}

      {/* Left: content */}
      <div className="land-hero-left" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ overflow: 'hidden', paddingBottom: '6px' }}>
          <motion.h1
            className="land-h1"
            initial={reduce ? false : { y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.0, delay: 0.06, ease: E }}
          >
            Entrena con
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: '30px', paddingBottom: '6px' }}>
          <motion.h1
            className="land-h1"
            style={{ color: '#b1c9e1' }}
            initial={reduce ? false : { y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1.0, delay: 0.2, ease: E }}
          >
            intención.
          </motion.h1>
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.48, ease: E }}
          className="land-sub"
        >
          Registra cada sesión, calcula PRs automáticamente y visualiza tu evolución semana a semana. Sin distracciones. Solo tú y tus números.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62, ease: E }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}
        >
          <MagneticCTA href="/registro" primary>
            Crear cuenta <ArrowRight style={{ width: '15px', height: '15px' }} />
          </MagneticCTA>
          <MagneticCTA href="/login">
            Iniciar sesión
          </MagneticCTA>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.82, ease: E }}
          style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
        >
          {[
            { icon: ShieldCheck, text: 'Gratis para siempre' },
            { icon: Target,      text: 'Sin límite de rutinas' },
            { icon: Flame,       text: 'Sin anuncios' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <b.icon style={{ width: '13px', height: '13px', color: 'rgba(177,201,225,0.5)' }} />
              <span style={{ fontSize: '12px', color: '#636870', fontWeight: '400' }}>{b.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: image */}
      <div className="land-hero-right">
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,12,16,0.55) 0%, transparent 35%), linear-gradient(to top, rgba(10,12,16,0.6) 0%, transparent 45%)' }} />
        <motion.div
          style={{ position: 'absolute', inset: '-14% 0', y: reduce ? 0 : imgY }}
          initial={reduce ? false : { scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: E }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMGS.hero} alt="Atleta entrenando en el gimnasio" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  )
}

/* ─── Marquee strip ───────────────────────────────────────── */
function MarqueeStrip() {
  const items = [
    { icon: BicepsFlexed, text: 'Registra sesiones' },
    { icon: Trophy,       text: 'Récords automáticos' },
    { icon: TrendingUp,   text: 'Progreso en kg' },
    { icon: Layers,       text: 'Historial completo' },
    { icon: BarChart2,    text: 'Dashboard visual' },
    { icon: CheckCircle2, text: 'Rutinas por día' },
    { icon: Timer,        text: 'Timer de descanso' },
    { icon: Download,     text: 'Exporta a CSV' },
  ]
  return (
    <div style={{ backgroundColor: '#0a0c10', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', padding: '13px 0' }}>
      <div className="land-marquee">
        {[...items, ...items].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 32px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <Icon style={{ width: '13px', height: '13px', color: '#b1c9e1', opacity: 0.65 }} />
              <span style={{ fontSize: '12px', color: '#636870', fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.text}</span>
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
    { icon: BicepsFlexed, title: 'Series dinámicas',   body: 'Agrega o elimina series en tiempo real mientras entrenas. La última serie se copia automáticamente.' },
    { icon: Timer,        title: 'Timer de descanso',  body: 'Temporizador de 1, 1.5, 2 o 3 minutos integrado. Te avisa cuando el descanso terminó.' },
    { icon: RotateCcw,    title: 'Repite sesiones',    body: 'Carga los pesos y reps de tu última sesión como plantilla con un solo toque.' },
    { icon: Trophy,       title: 'PRs automáticos',    body: 'Tu récord personal se actualiza solo cada vez que superas el peso máximo de un ejercicio.' },
    { icon: Share2,       title: 'Comparte tu PR',     body: 'Genera un mensaje con tu récord y compártelo directo desde la app. En móvil o escritorio.' },
    { icon: Download,     title: 'Exporta a CSV',      body: 'Descarga todo tu historial de entrenamiento en un archivo CSV en cualquier momento.' },
    { icon: BarChart2,    title: 'Dashboard visual',   body: 'Heatmap de 365 días, gráfica de progreso por ejercicio y volumen total acumulado por semana.' },
    { icon: Target,       title: 'RIR por serie',      body: 'Registra el Reps In Reserve de cada serie para controlar la intensidad con más precisión.' },
    { icon: Smartphone,   title: 'Optimizado móvil',   body: 'Interfaz diseñada para usarla desde el teléfono en el gym. Rápida, táctil, sin fricciones.' },
  ]
  return (
    <section style={{ backgroundColor: '#0d0f14', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#b1c9e1', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Todo lo que necesitas
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 64px', marginBottom: '56px', alignItems: 'end' }}>
          <LineReveal>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: '1.1', margin: 0 }}>
              Una herramienta.<br />Nueve razones para usarla.
            </h2>
          </LineReveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: '15px', color: '#636870', margin: 0, lineHeight: '1.7', fontWeight: '300', maxWidth: '400px' }}>
              VoltTrack tiene todo lo que necesitas para registrar, analizar y mejorar tu rendimiento en el gym — sin nada que sobre.
            </p>
          </Reveal>
        </div>

        <div className="land-features-grid">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={Math.floor(i / 3) * 0.06 + (i % 3) * 0.04}>
                <motion.div
                  className="land-feature-card"
                  whileHover={{ y: -3, borderColor: 'rgba(177,201,225,0.18)' }}
                  transition={{ duration: 0.22, ease: E }}
                >
                  <div style={{ backgroundColor: 'rgba(177,201,225,0.07)', border: '1px solid rgba(177,201,225,0.1)', borderRadius: '8px', padding: '9px', display: 'inline-flex', marginBottom: '16px' }}>
                    <Icon style={{ width: '16px', height: '16px', color: '#b1c9e1' }} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.01em', margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: '#636870', margin: 0, lineHeight: '1.65', fontWeight: '300' }}>{f.body}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Feature: editorial full-bleed ─────────────────────────── */
function FeatureEditorial() {
  return (
    <section style={{ position: 'relative', minHeight: '72vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMGS.registro} alt="Atleta realizando ejercicio" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,12,16,0.98) 0%, rgba(10,12,16,0.55) 45%, rgba(10,12,16,0.15) 100%)' }} />
      <div style={{ position: 'relative', padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,80px)', maxWidth: '680px' }}>
        <Reveal>
          <div style={{ backgroundColor: 'rgba(177,201,225,0.08)', border: '1px solid rgba(177,201,225,0.12)', borderRadius: '7px', padding: '7px', display: 'inline-flex', marginBottom: '22px' }}>
            <BicepsFlexed style={{ width: '15px', height: '15px', color: '#b1c9e1' }} />
          </div>
        </Reveal>
        <LineReveal delay={0.04}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: '1.1', margin: '0 0 16px' }}>
            Registro de sesiones
          </h2>
        </LineReveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: '15px', color: '#9199a3', margin: '0 0 14px', lineHeight: '1.7', fontWeight: '300', maxWidth: '460px' }}>
            Selecciona la rutina del día, llena pesos, reps y RIR por cada serie. Guardado en un clic. Los pesos de tu última sesión aparecen como referencia automáticamente.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {['Series +/- en tiempo real', 'Notas por serie', 'Timer integrado'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <CheckCircle2 style={{ width: '13px', height: '13px', color: '#b1c9e1', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#9199a3', fontWeight: '300' }}>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Feature: split layout ──────────────────────────────── */
function FeatureSplit({
  imgSrc, imgAlt, Icon, title, body, bullets = [], imgRight = false,
}: {
  imgSrc: string; imgAlt: string; Icon: React.ElementType;
  title: string; body: string; bullets?: string[]; imgRight?: boolean
}) {
  return (
    <div className={`land-split ${imgRight ? 'land-split--rev' : ''}`}>
      <div className={`land-split-img ${imgRight ? 'land-split-img--rev' : ''}`} style={{ position: 'relative', overflow: 'hidden', minHeight: '420px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={imgAlt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: imgRight ? 'linear-gradient(to left, rgba(13,15,20,0.4) 0%, transparent 50%)' : 'linear-gradient(to right, rgba(13,15,20,0.4) 0%, transparent 50%)' }} />
      </div>
      <div style={{ backgroundColor: '#0d0f14', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(52px,7vw,100px) clamp(32px,5vw,72px)' }}>
        <Reveal>
          <div style={{ backgroundColor: 'rgba(177,201,225,0.08)', border: '1px solid rgba(177,201,225,0.12)', borderRadius: '7px', padding: '7px', display: 'inline-flex', marginBottom: '24px' }}>
            <Icon style={{ width: '16px', height: '16px', color: '#b1c9e1' }} />
          </div>
        </Reveal>
        <LineReveal delay={0.04}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 46px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: '1.1', margin: '0 0 18px' }}>
            {title}
          </h2>
        </LineReveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: '15px', color: '#9199a3', margin: bullets.length > 0 ? '0 0 20px' : '0', lineHeight: '1.7', fontWeight: '300', maxWidth: '380px' }}>
            {body}
          </p>
        </Reveal>
        {bullets.length > 0 && (
          <Reveal delay={0.16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bullets.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '13px', height: '13px', color: '#b1c9e1', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#9199a3', fontWeight: '300' }}>{b}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}

/* ─── Stats ───────────────────────────────────────────────── */
function Stats() {
  return (
    <section style={{ backgroundColor: '#080a0e', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)' }}>
      <Reveal>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.03em', margin: '0 0 64px', lineHeight: '1.2', maxWidth: '480px', textWrap: 'balance' } as React.CSSProperties}>
          Diseñado para la sesión,<br />no para la galería.
        </h2>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { to: 100,  suffix: '%', label: 'Privado',        sub: 'Solo tú ves tus datos' },
          { to: 5,    suffix: '×', label: 'Días / semana',  sub: 'Rutinas ordenadas por día' },
          { to: 0,    suffix: '',  label: 'Distracciones',  sub: 'Interfaz solo para entrenar' },
        ].map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08}>
            <div style={{ padding: 'clamp(32px,4vw,52px) 0', paddingRight: 'clamp(16px,3vw,40px)' }}>
              <p style={{ fontSize: 'clamp(52px, 7vw, 88px)', fontWeight: '700', color: '#b1c9e1', letterSpacing: '-0.04em', margin: '0 0 8px', lineHeight: '0.95', fontVariantNumeric: 'tabular-nums' }}>
                <CountUp to={m.to} suffix={m.suffix} />
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#e2e2e8', margin: '0 0 4px' }}>{m.label}</p>
              <p style={{ fontSize: '13px', color: '#636870', margin: 0, fontWeight: '300' }}>{m.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Process ─────────────────────────────────────────────── */
function Process() {
  const steps = [
    { n: '01', title: 'Crea tus rutinas',    body: 'Organiza ejercicios por día de semana. Define cuántas series por ejercicio y agrégalos en el orden en que los haces. Usa el banco de más de 60 ejercicios o crea los tuyos.' },
    { n: '02', title: 'Registra la sesión',  body: 'Al llegar al gym, selecciona la rutina del día. Los pesos de tu última sesión ya están precargados como referencia. Actualiza cada serie, agrega notas si quieres, y guarda.' },
    { n: '03', title: 'Analiza tu progreso', body: 'El dashboard muestra la evolución de tu peso máximo por ejercicio, tu racha de días, el heatmap del año y el volumen acumulado. Tus PRs se actualizan solos en cada sesión.' },
  ]
  return (
    <section style={{ backgroundColor: '#0a0c10', padding: 'clamp(80px,10vw,128px) clamp(24px,5vw,80px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Reveal>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#b1c9e1', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 56px' }}>Cómo funciona</p>
        </Reveal>
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.07}>
            <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '0 32px', padding: 'clamp(28px,4vw,44px) 0', borderTop: '1px solid rgba(255,255,255,0.06)', alignItems: 'start' }}>
              <LineReveal delay={i * 0.07 + 0.04}>
                <span style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: '700', color: 'rgba(255,255,255,0.07)', letterSpacing: '-0.04em', lineHeight: '1', fontVariantNumeric: 'tabular-nums', display: 'block', paddingTop: '4px' }}>
                  {step.n}
                </span>
              </LineReveal>
              <div>
                <h3 style={{ fontSize: 'clamp(17px, 2.2vw, 24px)', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.02em', margin: '0 0 10px', lineHeight: '1.2' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#636870', margin: 0, lineHeight: '1.7', maxWidth: '520px', fontWeight: '300' }}>
                  {step.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Por qué VoltTrack ───────────────────────────────────── */
function WhySection() {
  const reasons = [
    { icon: ShieldCheck, title: 'Sin suscripción',  body: 'VoltTrack es completamente gratuito. No hay plan premium, no hay funciones bloqueadas, no hay trampas.' },
    { icon: Target,      title: 'Sin ruido',        body: 'No hay feed social, no hay stories, no hay notificaciones innecesarias. Entras, registras, sales.' },
    { icon: Flame,       title: 'Para el gymrat',   body: 'Construido por alguien que entrena, para personas que entrenan en serio y quieren ver sus números crecer.' },
  ]
  return (
    <section style={{ backgroundColor: '#0d0f14', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#b1c9e1', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>Por qué VoltTrack</p>
        </Reveal>
        <LineReveal>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: '1.1', margin: '0 0 56px', maxWidth: '560px' }}>
            Todas las apps de gym fallan en lo mismo. Esta no.
          </h2>
        </LineReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          {reasons.map((r, i) => {
            const Icon = r.icon
            return (
              <Reveal key={r.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(177,201,225,0.03)' }}
                  transition={{ duration: 0.2 }}
                  style={{ backgroundColor: '#0d0f14', padding: 'clamp(32px,4vw,52px) clamp(24px,3vw,40px)', height: '100%', boxSizing: 'border-box' }}
                >
                  <div style={{ backgroundColor: 'rgba(177,201,225,0.08)', border: '1px solid rgba(177,201,225,0.12)', borderRadius: '8px', padding: '9px', display: 'inline-flex', marginBottom: '20px' }}>
                    <Icon style={{ width: '16px', height: '16px', color: '#b1c9e1' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.02em', margin: '0 0 10px' }}>{r.title}</h3>
                  <p style={{ fontSize: '14px', color: '#636870', margin: 0, lineHeight: '1.7', fontWeight: '300' }}>{r.body}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: '64vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMGS.gym} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', opacity: 0.2 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,12,16,0.97) 0%, rgba(12,16,22,0.92) 100%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(177,201,225,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', textAlign: 'center', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', maxWidth: '720px' }}>
        <LineReveal>
          <h2 style={{ fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.04em', lineHeight: '1.05', margin: '0 0 18px', textWrap: 'balance' } as React.CSSProperties}>
            Tu próximo PR
          </h2>
        </LineReveal>
        <LineReveal delay={0.08}>
          <h2 style={{ fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: '700', color: '#b1c9e1', letterSpacing: '-0.04em', lineHeight: '1.05', margin: '0 0 22px', textWrap: 'balance' } as React.CSSProperties}>
            empieza hoy.
          </h2>
        </LineReveal>
        <Reveal delay={0.14}>
          <p style={{ fontSize: '15px', color: '#636870', margin: '0 0 40px', fontWeight: '300' }}>
            Gratis. Sin tarjeta. Sin límites de rutinas. Sin excusas.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticCTA href="/registro" primary>
              Crear cuenta gratis <ArrowRight style={{ width: '15px', height: '15px' }} />
            </MagneticCTA>
            <MagneticCTA href="/login">
              Ya tengo cuenta
            </MagneticCTA>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ padding: '24px clamp(24px,5vw,80px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#0a0c10' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ backgroundColor: '#b1c9e1', borderRadius: '6px', padding: '4px', display: 'flex' }}>
          <Zap style={{ width: '11px', height: '11px', color: '#0c0e12' }} />
        </div>
        <span style={{ fontSize: '12px', color: '#3d4147', fontWeight: '600', letterSpacing: '-0.01em' }}>VoltTrack</span>
      </div>
      <p style={{ fontSize: '12px', color: '#3d4147', margin: 0 }}>Performance Gym Tracker · Gratis para siempre</p>
    </footer>
  )
}

/* ─── CSS ─────────────────────────────────────────────────── */
const css = `
  .land-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px clamp(20px, 5vw, 60px);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  }
  .land-hero {
    display: grid;
    grid-template-columns: 54% 46%;
    min-height: 100dvh;
    background: #0a0c10;
    overflow: hidden;
    position: relative;
  }
  .land-hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(108px,13vw,156px) clamp(24px,5vw,80px) clamp(60px,8vw,100px);
    position: relative; z-index: 1;
  }
  .land-hero-right {
    position: relative;
    overflow: hidden;
  }
  .land-h1 {
    font-size: clamp(50px, 7.5vw, 86px);
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.03em;
    line-height: 0.95;
    margin: 0;
    display: block;
  }
  .land-sub {
    font-size: clamp(14px, 1.6vw, 16px);
    color: #9199a3;
    line-height: 1.7;
    max-width: 400px;
    margin: 0 0 36px;
    font-weight: 300;
  }
  .land-split {
    display: grid;
    grid-template-columns: 54% 46%;
    min-height: 58vh;
    overflow: hidden;
  }
  .land-split--rev {
    grid-template-columns: 46% 54%;
  }
  .land-split-img { order: 0; }
  .land-split-img--rev { order: 1; }
  .land-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background-color: rgba(255,255,255,0.05);
    border-radius: 12px;
    overflow: hidden;
  }
  .land-feature-card {
    background-color: #0d0f14;
    padding: clamp(24px,3vw,36px) clamp(20px,2.5vw,32px);
    border: 1px solid transparent;
    transition: border-color 0.2s ease;
  }
  .land-marquee {
    display: flex; width: max-content;
    animation: marquee 34s linear infinite;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .land-marquee:hover { animation-play-state: paused; }
  @media (max-width: 767px) {
    .land-hero {
      grid-template-columns: 1fr;
      grid-template-rows: auto 52vw;
    }
    .land-hero-left {
      padding: 96px 20px 36px;
    }
    .land-h1 { font-size: clamp(42px, 11vw, 58px); }
    .land-split, .land-split--rev {
      grid-template-columns: 1fr;
    }
    .land-split-img--rev { order: -1; }
    .land-features-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .land-features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
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
      <div style={{ backgroundColor: '#0a0c10', color: '#e2e2e8', minHeight: '100dvh', fontFamily: 'var(--font-lexend), system-ui, sans-serif' }}>
        <Nav />
        <Hero />
        <MarqueeStrip />
        <FeaturesGrid />
        <FeatureEditorial />
        <FeatureSplit
          imgSrc={IMGS.records}
          imgAlt="Atleta levantando pesas"
          Icon={Trophy}
          title="Récords automáticos"
          body="Cada vez que superas tu peso máximo en un ejercicio, VoltTrack lo registra como tu nuevo PR sin configurar nada. Además calcula tu 1RM estimado con la fórmula Epley."
          bullets={['1RM calculado automáticamente', 'Ranking de ejercicios por fuerza', 'Comparte tu PR en un clic']}
        />
        <FeatureSplit
          imgSrc={IMGS.progreso}
          imgAlt="Dashboard de progreso atlético"
          Icon={TrendingUp}
          title="Progreso visual"
          body="Dashboard con heatmap de 365 días al estilo GitHub, gráfica de evolución de peso máximo por ejercicio y volumen total semanal. Todo en un vistazo."
          bullets={['Heatmap anual de actividad', 'Racha de días consecutivos', 'Volumen por sesión y semana']}
          imgRight
        />
        <Stats />
        <Process />
        <WhySection />
        <FinalCTA />
        <Footer />
      </div>
    </>
  )
}
