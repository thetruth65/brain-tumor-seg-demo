// ClassificationPanel.jsx
import { motion } from 'framer-motion'
import { CLASS_INFO } from '../lib/postprocess'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

const CLASS_ORDER = ['glioma', 'meningioma', 'pituitary', 'none']

export default function ClassificationPanel({ tumorClass, classification, confidence, isDemo }) {
  const info = CLASS_INFO[tumorClass] || CLASS_INFO.glioma
  const hasTumor = tumorClass !== 'none'

  return (
    <div className="space-y-4">
      {/* Primary prediction card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative glass rounded-2xl p-5 overflow-hidden"
        style={{ borderColor: `${info.color}30` }}
      >
        {/* Glow accent */}
        <div
          className="absolute inset-0 opacity-10 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle at 20% 50%, ${info.color}, transparent 70%)` }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
              Predicted Class
            </p>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: info.color }}
            >
              {info.label}
            </h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {info.description}
            </p>
          </div>

          <div className="shrink-0 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: `${info.color}50`, backgroundColor: `${info.color}15` }}
            >
              <span className="font-display font-bold text-lg" style={{ color: info.color }}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">confidence</p>
          </div>
        </div>

        {/* Severity badge */}
        {hasTumor && (
          <div className="mt-3 flex items-center gap-2">
            {info.severity === 'high' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-500/15 text-red-400 border border-red-500/25">
                <AlertTriangle className="w-3 h-3" /> High Grade
              </span>
            )}
            {info.severity === 'moderate' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <Info className="w-3 h-3" /> Moderate
              </span>
            )}
            {info.severity === 'low' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-violet-500/15 text-violet-400 border border-violet-500/25">
                <CheckCircle className="w-3 h-3" /> Usually Benign
              </span>
            )}
            {!hasTumor && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <CheckCircle className="w-3 h-3" /> Clear
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Per-class probability bars */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5 space-y-3"
      >
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Class Probabilities
        </p>

        {CLASS_ORDER.map((cls, i) => {
          const prob = classification?.[cls] ?? 0
          const clsInfo = CLASS_INFO[cls]
          const isTop = cls === tumorClass

          return (
            <motion.div
              key={cls}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono ${isTop ? 'font-semibold' : 'text-slate-400'}`}
                  style={isTop ? { color: clsInfo.color } : {}}
                >
                  {clsInfo.label}
                  {isTop && <span className="ml-1.5 text-[10px] opacity-60">▲ top</span>}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: isTop ? clsInfo.color : '#64748b' }}
                >
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prob * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: clsInfo.color, opacity: isTop ? 1 : 0.5 }}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {isDemo && (
        <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 font-mono">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Demo mode</strong> — model.onnx not found in /public. 
            Place your converted ONNX model there for real inference.
          </span>
        </div>
      )}
    </div>
  )
}