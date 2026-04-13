// MetricsDisplay.jsx
import { motion } from 'framer-motion'

export default function MetricsDisplay({ stats, confidence, tumorClass }) {
  if (!stats) return null

  const hasTumor = tumorClass !== 'none'
  const areaPct = (stats.area * 100).toFixed(2)
  const tumorPx = stats.tumorPixels.toLocaleString()

  const metrics = hasTumor
    ? [
        { label: 'Tumor Area', value: `${areaPct}%`, sub: `${tumorPx} px` },
        { label: 'Seg Confidence', value: `${(confidence * 100).toFixed(1)}%`, sub: 'avg foreground' },
        {
          label: 'Centroid',
          value: stats.bbox ? `(${stats.bbox.cx}, ${stats.bbox.cy})` : '—',
          sub: 'pixels (x, y)',
        },
        {
          label: 'Bounding Box',
          value: stats.bbox ? `${stats.bbox.w}×${stats.bbox.h}` : '—',
          sub: 'width × height',
        },
      ]
    : [
        { label: 'Tumor Area', value: '0.00%', sub: '0 px detected' },
        { label: 'Seg Confidence', value: `${(confidence * 100).toFixed(1)}%`, sub: 'no tumor region' },
        { label: 'Centroid', value: '—', sub: 'no region' },
        { label: 'Bounding Box', value: '—', sub: 'no region' },
      ]

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
        Segmentation Metrics
      </p>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="bg-surface-700 rounded-xl p-3 border border-surface-600"
          >
            <p className="text-xs text-slate-500 font-mono mb-1">{label}</p>
            <p className="font-display font-semibold text-slate-100 text-sm">{value}</p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}