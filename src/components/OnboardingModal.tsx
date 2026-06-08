'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Zap, BicepsFlexed, Trophy, BarChart2, Scale, X, ChevronRight, ArrowRight } from 'lucide-react'

const STORAGE_KEY = 'volttrack_onboarding_done'

const steps = [
  {
    icon: BicepsFlexed,
    color: '#2d7fad',
    title: '¡Bienvenido a VoltTrack!',
    body: 'Tu app para registrar entrenamientos, calcular PRs y visualizar tu progreso. 100% gratis, sin anuncios.',
    cta: 'Siguiente',
  },
  {
    icon: Trophy,
    color: '#c07040',
    title: 'PRs y 1RM automáticos',
    body: 'Cada vez que bates un récord personal se detecta solo. También calcula tu 1RM estimado con la fórmula de Epley.',
    cta: 'Siguiente',
  },
  {
    icon: BarChart2,
    color: '#2e9a60',
    title: 'Dashboard con heatmap',
    body: 'Visualiza 365 días de actividad, gráficas de progreso por ejercicio y tu racha de entrenamiento activa.',
    cta: 'Siguiente',
  },
  {
    icon: Scale,
    color: '#9060c0',
    title: 'Controla tu peso corporal',
    body: 'Registra tu peso diario desde el dashboard o la sección Peso. Ve la tendencia semana a semana.',
    cta: 'Empezar →',
  },
]

export default function OnboardingModal() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Only show if user hasn't dismissed before
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  const current = steps[step]
  const Icon = current.icon

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 101,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '100%', maxWidth: '420px',
              backgroundColor: 'var(--surface-base)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.32), 0 8px 24px rgba(0,0,0,0.16)',
              overflow: 'hidden',
              pointerEvents: 'auto',
            }}>
              {/* Progress bar */}
              <div style={{ height: '3px', backgroundColor: 'var(--border-faint)' }}>
                <motion.div
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '0 2px 2px 0' }}
                />
              </div>

              <div style={{ padding: '28px 28px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ backgroundColor: 'var(--accent)', borderRadius: '7px', padding: '5px', display: 'flex' }}>
                      <Zap style={{ width: '12px', height: '12px', color: '#fff' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>VoltTrack</span>
                  </div>
                  <button
                    onClick={dismiss}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', display: 'flex', borderRadius: '6px' }}
                  >
                    <X style={{ width: '15px', height: '15px' }} />
                  </button>
                </div>

                {/* Step content with slide animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '16px',
                      backgroundColor: `${current.color}18`,
                      border: `1px solid ${current.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '20px',
                    }}>
                      <Icon style={{ width: '26px', height: '26px', color: current.color }} />
                    </div>

                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: '1.2' }}>
                      {current.title}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: '1.7', fontWeight: '300' }}>
                      {current.body}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Footer: dots + CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Dot indicators */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStep(i)}
                        style={{
                          width: i === step ? '18px' : '6px',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: i === step ? 'var(--accent)' : 'var(--border-subtle)',
                          border: 'none', cursor: 'pointer', padding: 0,
                          transition: 'all 0.25s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={next}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      backgroundColor: 'var(--accent)', color: '#fff',
                      border: 'none', borderRadius: '10px',
                      padding: '10px 18px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background-color 0.14s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#246a94'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                  >
                    {current.cta}
                    {step < steps.length - 1
                      ? <ChevronRight style={{ width: '13px', height: '13px' }} />
                      : <ArrowRight style={{ width: '13px', height: '13px' }} />
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
