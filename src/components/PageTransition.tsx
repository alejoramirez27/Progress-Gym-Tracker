'use client'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce   = useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduce ? {} : { opacity: 0, x: -10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
