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
  Share2, Download, Smartphone, Target, ShieldCheck, Flame, Dumbbell,
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
  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

/* ─── Magnetic CTA ───────────────────────────────────────── */
function MagneticCTA({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0); const my = useMotionValue(0)
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
      <Link href={href}
        style={primary ? {
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#2d7fad', color: '#ffffff',
          textDecoration: 'none', padding: '14px 26px', borderRadius: '9px',
          fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em',
          transition: 'background-color 0.14s, box-shadow 0.2s',
          boxShadow: '0 0 0 0 rgba(45,127,173,0)',
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
          if (primary) e.currentTarget.style.boxShadow = '0 4px 20px rgba(45,127,173,0.22)'
          if (!primary) e.currentTarget.style.borderColor = '#c4c9d1'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = primary ? '#2d7fad' : 'transparent'
          if (primary) e.currentTarget.style.boxShadow = '0 0 0 0 rgba(45,127,173,0)'
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
      <div />
    </motion.header>
  )
}

/* ─── Floating achievement card ──────────────────────────── */
function AchievementCard({ icon, label, value, delay = 0, style = {} }: {
  icon: React.ReactNode; label: string; value: string; delay?: number; style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: E }}
      style={{
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        zIndex: 4,
        ...style,
      }}
    >
      <div style={{ backgroundColor: 'rgba(45,127,173,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '10px', color: '#7a8290', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111318', margin: 0, letterSpacing: '-0.01em' }}>{value}</p>
      </div>
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
        {/* Label chip */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: E }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#e8f3fb', border: '1px solid rgba(45,127,173,0.2)', borderRadius: '99px', padding: '5px 12px', marginBottom: '20px' }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2d7fad' }} />
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#2d7fad', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gym Performance Tracker</span>
        </motion.div>

        <div style={{ overflow: 'hidden', paddingBottom: '6px' }}>
          <motion.h1 className="land-h1" initial={reduce ? false : { y: '105%' }} animate={{ y: '0%' }} transition={{ duration: 1.0, delay: 0.1, ease: E }}>
            Entrena con
          </motion.h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: '20px', paddingBottom: '6px' }}>
          <motion.h1 className="land-h1" style={{ color: '#2d7fad' }} initial={reduce ? false : { y: '105%' }} animate={{ y: '0%' }} transition={{ duration: 1.0, delay: 0.22, ease: E }}>
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
          <MagneticCTA href="/login">
            Iniciar sesión
          </MagneticCTA>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.84, ease: E }}
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

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: scrollOpacity, marginTop: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
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

      {/* Right: image + floating cards */}
      <div className="land-hero-right" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.85) 0%, transparent 28%), linear-gradient(to top, rgba(255,255,255,0.5) 0%, transparent 35%)' }} />
        <motion.div
          style={{ position: 'absolute', inset: '-14% 0', y: reduce ? 0 : imgY }}
          initial={reduce ? false : { scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: E }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMGS.hero} alt="Atleta entrenando en el gimnasio" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        </motion.div>

        {/* Floating achievement cards */}
        <AchievementCard
          icon={<Trophy style={{ width: '14px', height: '14px', color: '#c07040' }} />}
          label="Nuevo PR"
          value="Press banca · 130 kg"
          delay={1.1}
          style={{ top: '22%', right: '8%' }}
        />
        <AchievementCard
          icon={<Flame style={{ width: '14px', height: '14px', color: '#e06030' }} />}
          label="Racha activa"
          value="18 días seguidos 🔥"
          delay={1.35}
          style={{ top: '44%', right: '14%' }}
        />
        <AchievementCard
          icon={<TrendingUp style={{ width: '14px', height: '14px', color: '#2e9a60' }} />}
          label="Progreso mensual"
          value="+12 kg en sentadilla"
          delay={1.6}
          style={{ bottom: '24%', right: '7%' }}
        />
      </div>
    </section>
  )
}

/* ─── Marquee strip ───────────────────────────────────────── */
function MarqueeStrip() {
  const items = [
    { icon: BicepsFlexed, text: 'Registra sesiones' },
    { icon: Trophy,       text: 'Récords automáticos' },
    { icon: TrendingUp,   text: 'Progreso visual' },
    { icon: Layers,       text: 'Historial completo' },
    { icon: BarChart2,    text: 'Dashboard 365 días' },
    { icon: CheckCircle2, text: 'Rutinas por día' },
    { icon: Timer,        text: 'Timer de descanso' },
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
    { icon: Timer,        title: 'Timer de descanso', body: 'Temporizador de 1, 1.5, 2 o 3 min. Te avisa cuando el descanso terminó.' },
    { icon: RotateCcw,    title: 'Repite sesiones',   body: 'Carga la plantilla de tu última sesión con un solo toque. Sin reescribir.' },
    { icon: Trophy,       title: 'PRs automáticos',   body: 'Tu récord personal se actualiza solo. También calcula tu 1RM estimado.' },
    { icon: Share2,       title: 'Comparte tu PR',    body: 'Un mensaje con tu récord se genera solo. Compártelo directo desde la app.' },
    { icon: Download,     title: 'Exporta a CSV',     body: 'Descarga todo tu historial de entrenamiento cuando quieras.' },
    { icon: BarChart2,    title: 'Dashboard visual',  body: 'Heatmap de 365 días, gráfica de progreso por ejercicio y volumen semanal.' },
    { icon: Target,       title: 'RIR por serie',     body: 'Controla la intensidad con Reps In Reserve en cada serie.' },
    { icon: Smartphone,   title: 'Optimizado móvil',  body: 'Diseñado para usarlo desde el teléfono en el gym. Rápido y táctil.' },
  ]

  return (
    <section style={{ position: 'relative', backgroundColor: '#f8f9fb', padding: 'clamp(64px,8vw,100px) clamp(24px,5vw,80px)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(45,127,173,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '52px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px', alignItems: 'end' }}>
            <div>
              <LineReveal>
                <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700', color: '#111318', letterSpacing: '-0.038em', lineHeight: '1.03', margin: '0 0 12px' }}>
                  Todo lo que<br />necesitas.
                </h2>
              </LineReveal>
              <Reveal delay={0.06}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d7fad', letterSpacing: '0.02em', margin: 0 }}>
                  9 funciones · 0 fricciones
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <p style={{ fontSize: '16px', color: '#7a8290', margin: '0', lineHeight: '1.65', fontWeight: '300' }}>
                Cada función fue diseñada para eliminar una fricción real que los atletas tienen cuando registran su entrenamiento.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Cards grid */}
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
                  {/* Top accent line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: Math.floor(i / 3) * 0.05 + (i % 3) * 0.04 + 0.1, ease: E }}
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

/* ─── Feature editorial ──────────────────────────────────── */
function FeatureEditorial() {
  return (
    <section style={{ position: 'relative', minHeight: '75vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMGS.registro} alt="Atleta realizando ejercicio" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,12,16,1) 0%, rgba(10,12,16,0.55) 40%, rgba(10,12,16,0.08) 100%)' }} />
      <div style={{ position: 'relative', padding: 'clamp(52px,6vw,88px) clamp(24px,5vw,80px)', maxWidth: '720px' }}>
        <Reveal>
          <div style={{ backgroundColor: 'rgba(45,127,173,0.15)', border: '1px solid rgba(45,127,173,0.25)', borderRadius: '8px', padding: '8px', display: 'inline-flex', marginBottom: '24px' }}>
            <BicepsFlexed style={{ width: '16px', height: '16px', color: '#7ab8d4' }} />
          </div>
        </Reveal>
        <LineReveal delay={0.04}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 58px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.035em', lineHeight: '1.05', margin: '0 0 18px' }}>
            Registro de sesiones
          </h2>
        </LineReveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: '16px', color: '#9aa0a8', margin: '0 0 24px', lineHeight: '1.7', fontWeight: '300', maxWidth: '500px' }}>
            Selecciona la rutina del día, y los pesos de tu última sesión aparecen como referencia automáticamente. Actualiza lo que cambió y guarda en un clic.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {['Series +/– en tiempo real', 'Notas por serie', 'Timer de descanso integrado'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px', color: '#7ab8d4', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#9aa0a8', fontWeight: '300' }}>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Feature split ──────────────────────────────────────── */
function FeatureSplit({
  imgSrc, imgAlt, Icon, title, body, bullets = [], imgRight = false,
}: {
  imgSrc: string; imgAlt: string; Icon: React.ElementType;
  title: string; body: string; bullets?: string[]; imgRight?: boolean
}) {
  return (
    <div className={`land-split ${imgRight ? 'land-split--rev' : ''}`}>
      <motion.div
        className={`land-split-img ${imgRight ? 'land-split-img--rev' : ''}`}
        style={{ position: 'relative', overflow: 'hidden', minHeight: '480px' }}
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.7, ease: E }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={imgAlt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: imgRight ? 'linear-gradient(to left, rgba(248,249,251,0.65) 0%, transparent 50%)' : 'linear-gradient(to right, rgba(248,249,251,0.65) 0%, transparent 50%)' }} />
      </motion.div>
      <div style={{ backgroundColor: '#f8f9fb', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(52px,7vw,100px) clamp(32px,5vw,72px)' }}>
        <Reveal>
          <div style={{ backgroundColor: '#e8f3fb', border: '1px solid rgba(45,127,173,0.15)', borderRadius: '8px', padding: '8px', display: 'inline-flex', marginBottom: '24px' }}>
            <Icon style={{ width: '16px', height: '16px', color: '#2d7fad' }} />
          </div>
        </Reveal>
        <LineReveal delay={0.04}>
          <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 50px)', fontWeight: '700', color: '#111318', letterSpacing: '-0.035em', lineHeight: '1.08', margin: '0 0 18px' }}>
            {title}
          </h2>
        </LineReveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: '16px', color: '#7a8290', margin: bullets.length > 0 ? '0 0 24px' : '0', lineHeight: '1.7', fontWeight: '300', maxWidth: '400px' }}>
            {body}
          </p>
        </Reveal>
        {bullets.length > 0 && (
          <Reveal delay={0.16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bullets.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2d7fad', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#7a8290', fontWeight: '300' }}>{b}</span>
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
    <section style={{ position: 'relative', backgroundColor: '#ffffff', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', overflow: 'hidden', borderTop: '1px solid #eceef2' }}>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '900px', height: '400px', background: 'radial-gradient(ellipse, rgba(45,127,173,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <Reveal>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 40px)', fontWeight: '700', color: '#111318', letterSpacing: '-0.03em', margin: '0 0 72px', lineHeight: '1.15', maxWidth: '520px', textWrap: 'balance' } as React.CSSProperties}>
            Diseñado para la sesión,<br />no para la galería.
          </h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', borderTop: '1px solid #eceef2' }}>
          {[
            { to: 100,  suffix: '%', label: 'Privado',        sub: 'Solo tú ves tus datos',          color: '#2d7fad' },
            { to: 5,    suffix: '×', label: 'Días / semana',  sub: 'Rutinas ordenadas por día',       color: '#2e9a60' },
            { to: 0,    suffix: '',  label: 'Distracciones',  sub: 'Interfaz solo para entrenar',     color: '#c07040' },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 0.1}>
              <div style={{ padding: 'clamp(36px,4.5vw,56px) 0', paddingRight: 'clamp(16px,3vw,40px)' }}>
                <p style={{ fontSize: 'clamp(56px, 8vw, 96px)', fontWeight: '700', color: m.color, letterSpacing: '-0.05em', margin: '0 0 10px', lineHeight: '0.92', fontVariantNumeric: 'tabular-nums' }}>
                  <CountUp to={m.to} suffix={m.suffix} />
                </p>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111318', margin: '0 0 5px', letterSpacing: '-0.01em' }}>{m.label}</p>
                <p style={{ fontSize: '13px', color: '#9aa0a8', margin: 0, fontWeight: '300' }}>{m.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Process ─────────────────────────────────────────────── */
function Process() {
  const steps = [
    { n: '01', title: 'Crea tus rutinas',    body: 'Organiza ejercicios por día de semana con el banco de más de 60 movimientos. Define series, orden, y listo.' },
    { n: '02', title: 'Registra la sesión',  body: 'Selecciona la rutina del día. Los pesos de la última sesión aparecen de referencia. Solo actualiza lo que cambió.' },
    { n: '03', title: 'Analiza tu progreso', body: 'Dashboard con heatmap de 365 días, curva de fuerza por ejercicio y racha de días. Tus PRs se actualizan solos.' },
  ]
  return (
    <section style={{ backgroundColor: '#f8f9fb', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', borderTop: '1px solid #eceef2' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '64px' }}>
          <LineReveal>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700', color: '#111318', letterSpacing: '-0.038em', lineHeight: '1.03', margin: '0 0 12px' }}>
              Cómo funciona.
            </h2>
          </LineReveal>
          <Reveal delay={0.06}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d7fad', letterSpacing: '0.02em', margin: 0 }}>
              3 pasos · del gym a los datos
            </p>
          </Reveal>
        </div>
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.06}>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.22, ease: E }}
              style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0 28px', padding: 'clamp(32px,4.5vw,52px) 0', borderTop: '1px solid #eceef2', alignItems: 'start' }}
            >
              <div>
                <span style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: '700', color: 'rgba(45,127,173,0.12)', letterSpacing: '-0.05em', lineHeight: '1', fontVariantNumeric: 'tabular-nums', display: 'block' }}>
                  {step.n}
                </span>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: '600', color: '#111318', letterSpacing: '-0.025em', margin: '0 0 12px', lineHeight: '1.15' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#7a8290', margin: 0, lineHeight: '1.7', maxWidth: '560px', fontWeight: '300' }}>
                  {step.body}
                </p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Why VoltTrack ───────────────────────────────────────── */
function WhySection() {
  const reasons = [
    {
      icon: ShieldCheck,
      title: 'Gratis para siempre',
      body: 'No hay plan premium, no hay funciones bloqueadas, no hay trampas. Todo lo que ves es todo lo que hay — sin costo.',
    },
    {
      icon: Target,
      title: 'Cero distracciones',
      body: 'Sin feed social, sin stories, sin notificaciones innecesarias. Entras al gym, registras tu sesión, sales. Así de simple.',
    },
    {
      icon: Dumbbell,
      title: 'Hecho por alguien que entrena',
      body: 'Cada función surgió de un problema real en el gym. No es teoría — es la app que el creador quería tener.',
    },
    {
      icon: Download,
      title: 'Tus datos son tuyos',
      body: 'Exporta todo tu historial en CSV en cualquier momento. Sin bloqueos, sin suscripción requerida para acceder.',
    },
    {
      icon: TrendingUp,
      title: 'Progreso real, no estimado',
      body: 'Registras exactamente lo que levantaste. El sistema calcula tus PRs y 1RM a partir de datos reales, no suposiciones.',
    },
    {
      icon: Smartphone,
      title: 'Rápido desde el celular',
      body: 'Carga en menos de un segundo. Interfaz táctil optimizada para usarla parado frente a la barra, no sentado en un escritorio.',
    },
  ]
  return (
    <section style={{ backgroundColor: '#ffffff', padding: 'clamp(80px,10vw,120px) clamp(24px,5vw,80px)', borderTop: '1px solid #eceef2' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '52px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px', alignItems: 'end' }}>
            <div>
              <LineReveal>
                <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '700', color: '#111318', letterSpacing: '-0.038em', lineHeight: '1.03', margin: '0 0 12px' }}>
                  Por qué VoltTrack.
                </h2>
              </LineReveal>
              <Reveal delay={0.06}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d7fad', letterSpacing: '0.02em', margin: 0 }}>
                  6 razones · ninguna es marketing
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <p style={{ fontSize: '16px', color: '#7a8290', margin: 0, lineHeight: '1.65', fontWeight: '300' }}>
                La mayoría de apps de gym fallan porque son demasiado complicadas, lentas o te muestran anuncios mientras intentas concentrarte. VoltTrack no hace ninguna de esas cosas.
              </p>
            </Reveal>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: '#eceef2', borderRadius: '14px', overflow: 'hidden' }}>
          {reasons.map((r, i) => {
            const Icon = r.icon
            return (
              <Reveal key={r.title} delay={Math.floor(i / 3) * 0.06 + (i % 3) * 0.04}>
                <motion.div
                  whileHover={{ backgroundColor: '#f3f7fb' }}
                  transition={{ duration: 0.18 }}
                  style={{ backgroundColor: '#ffffff', padding: 'clamp(28px,3.8vw,44px) clamp(24px,3vw,36px)', height: '100%', boxSizing: 'border-box' }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: Math.floor(i / 3) * 0.06 + (i % 3) * 0.05 + 0.1, ease: E }}
                    style={{ height: '1px', backgroundColor: '#dde0e6', marginBottom: '22px', transformOrigin: 'left' }}
                  />
                  <motion.div
                    whileHover={{ rotate: 6, scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                    style={{ backgroundColor: '#e8f3fb', border: '1px solid rgba(45,127,173,0.15)', borderRadius: '9px', padding: '9px', display: 'inline-flex', marginBottom: '18px' }}
                  >
                    <Icon style={{ width: '16px', height: '16px', color: '#2d7fad' }} />
                  </motion.div>
                  <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111318', letterSpacing: '-0.02em', margin: '0 0 9px', lineHeight: '1.25' }}>{r.title}</h3>
                  <p style={{ fontSize: '13px', color: '#7a8290', margin: 0, lineHeight: '1.7', fontWeight: '300' }}>{r.body}</p>
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
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: '68vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMGS.gym} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', opacity: 0.22 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,10,14,0.97) 0%, rgba(12,16,22,0.93) 100%)' }} />
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

/* ─── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ padding: '28px clamp(24px,5vw,80px)', borderTop: '1px solid #eceef2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#f8f9fb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ backgroundColor: '#2d7fad', borderRadius: '6px', padding: '4px', display: 'flex' }}>
          <Zap style={{ width: '11px', height: '11px', color: '#ffffff' }} />
        </div>
        <span style={{ fontSize: '12px', color: '#9aa0a8', fontWeight: '600', letterSpacing: '-0.01em' }}>VoltTrack</span>
      </div>
      <p style={{ fontSize: '12px', color: '#c4c9d1', margin: 0 }}>Performance Gym Tracker · Gratis para siempre</p>
    </footer>
  )
}

/* ─── CSS ─────────────────────────────────────────────────── */
const css = `
  .land-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px clamp(20px, 5vw, 60px);
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(96px,11vw,130px) clamp(24px,5vw,80px) clamp(48px,6vw,72px);
    position: relative; z-index: 1;
  }
  .land-hero-right {
    position: relative;
    overflow: hidden;
  }
  .land-h1 {
    font-size: clamp(52px, 7.8vw, 90px);
    font-weight: 700;
    color: #111318;
    letter-spacing: -0.035em;
    line-height: 0.94;
    margin: 0;
    display: block;
  }
  .land-sub {
    font-size: clamp(15px, 1.6vw, 17px);
    color: #7a8290;
    line-height: 1.65;
    max-width: 420px;
    margin: 0 0 28px;
    font-weight: 300;
  }
  .land-split {
    display: grid;
    grid-template-columns: 52% 48%;
    min-height: 60vh;
    overflow: hidden;
  }
  .land-split--rev {
    grid-template-columns: 48% 52%;
  }
  .land-split-img { order: 0; }
  .land-split-img--rev { order: 1; }
  .land-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background-color: #e0e3e7;
    border-radius: 14px;
    overflow: hidden;
  }
  .land-feature-card {
    background-color: #ffffff;
    padding: clamp(22px,3vw,32px) clamp(20px,2.5vw,28px);
    border: 1px solid transparent;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    cursor: default;
  }
  .land-feature-card:hover {
    background-color: #f3f7fb;
  }
  .land-marquee {
    display: flex; width: max-content;
    animation: marquee 36s linear infinite;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .land-marquee:hover { animation-play-state: paused; }
  @media (max-width: 767px) {
    .land-hero {
      grid-template-columns: 1fr;
      grid-template-rows: auto 56vw;
    }
    .land-hero-left { padding: 100px 20px 40px; }
    .land-h1 { font-size: clamp(44px, 12vw, 60px); }
    .land-split, .land-split--rev { grid-template-columns: 1fr; }
    .land-split-img--rev { order: -1; }
    .land-features-grid { grid-template-columns: 1fr; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .land-features-grid { grid-template-columns: repeat(2, 1fr); }
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
        <FeatureEditorial />
        <FeatureSplit
          imgSrc={IMGS.records}
          imgAlt="Atleta levantando pesas"
          Icon={Trophy}
          title="Récords automáticos"
          body="Cada vez que superas tu peso máximo en un ejercicio, VoltTrack lo registra como nuevo PR. Además calcula tu 1RM estimado con la fórmula Epley."
          bullets={['1RM calculado automáticamente', 'Ranking de ejercicios por fuerza', 'Comparte tu PR en un clic']}
        />
        <FeatureSplit
          imgSrc={IMGS.progreso}
          imgAlt="Dashboard de progreso atlético"
          Icon={TrendingUp}
          title="Progreso visual"
          body="Dashboard con heatmap de 365 días al estilo GitHub, curva de evolución de peso máximo por ejercicio y volumen total acumulado."
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
