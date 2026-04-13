// LoadingOverlay.jsx
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function LoadingOverlay({ progress }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[280px]"
    >
      {/* Animated brain rings */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-brand-cyan/20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-brand-cyan/40 animate-ping" />
          <div className="absolute inset-0 rounded-full border border-brand-cyan/20 animate-ping [animation-delay:0.4s]" />
          <Brain className="w-8 h-8 text-brand-cyan animate-pulse" />
        </div>
      </div>

      {/* Animated bar */}
      <div className="w-48 h-1 bg-surface-600 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-cyan"
          style={{ backgroundSize: '200% 100%' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <p className="font-mono text-sm text-brand-cyan">{progress || 'Initialising…'}</p>
      <p className="font-body text-xs text-slate-600 mt-2">
        EfficientNetV2-S + UNet inference
      </p>
    </motion.div>
  )
}