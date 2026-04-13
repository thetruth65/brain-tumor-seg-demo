// Header.jsx
import { Brain, Activity, Cpu } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="relative z-10 pt-12 pb-8 text-center px-4">
      {/* Animated background ring */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2 w-32 h-32 rounded-full border border-brand-cyan/10 animate-ping opacity-20 pointer-events-none" />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 w-48 h-48 rounded-full border border-brand-cyan/5 animate-ping [animation-delay:0.5s] opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex items-center justify-center gap-3 mb-5"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-surface-700 border border-brand-cyan/30 flex items-center justify-center glow-cyan">
            <Brain className="w-6 h-6 text-brand-cyan" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-cyan animate-pulse" />
        </div>

        <div className="text-left">
          <p className="font-mono text-xs text-brand-cyan/60 tracking-widest uppercase">
            EfficientNetV2-S + UNet
          </p>
          <h1
            className="font-display text-3xl md:text-4xl font-bold text-gradient-cyan leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            MRI Scan<span className="text-white/90"> AI</span>
          </h1>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-body text-sm md:text-base text-slate-400 max-w-lg mx-auto leading-relaxed"
      >
        Deep learning–powered brain tumor segmentation from CE-MRI scans.
        <br className="hidden md:block" />
        Detects &amp; localises{' '}
        <span className="text-tumor-meningioma font-medium">meningioma</span>,{' '}
        <span className="text-tumor-glioma font-medium">glioma</span>, and{' '}
        <span className="text-tumor-pituitary font-medium">pituitary</span> tumors.
      </motion.p>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex items-center justify-center gap-6 mt-6"
      >
        {[
          { icon: <Cpu className="w-3.5 h-3.5" />, label: 'EfficientNetV2-S encoder' },
          { icon: <Activity className="w-3.5 h-3.5" />, label: 'U-Net decoder' },
          { icon: <Brain className="w-3.5 h-3.5" />, label: '256×256 input' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="text-brand-cyan/60">{icon}</span>
            {label}
          </div>
        ))}
      </motion.div>
    </header>
  )
}