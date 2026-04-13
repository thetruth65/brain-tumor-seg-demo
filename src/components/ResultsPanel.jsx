// ResultsPanel.jsx
import { motion } from 'framer-motion'
import { RotateCcw, Download } from 'lucide-react'
import SegmentationCanvas from './SegmentationCanvas'
import ClassificationPanel from './ClassificationPanel'
import MetricsDisplay from './MetricsDisplay'

export default function ResultsPanel({ imgEl, result, onReset }) {
  if (!result) return null
  const { maskData, tumorClass, classification, confidence, isDemo, stats, imageSize } = result

  const handleDownload = () => {
    // Create a combined canvas for download
    const canvas = document.createElement('canvas')
    const size = 512
    canvas.width = size * 2
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Left: original
    ctx.drawImage(imgEl, 0, 0, size, size)

    // Right: draw mask overlay
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 256; tempCanvas.height = 256
    import('../lib/postprocess').then(({ drawMaskOverlay }) => {
      drawMaskOverlay(tempCanvas, imgEl, maskData, tumorClass, 0.5)
      ctx.drawImage(tempCanvas, size, 0, size, size)

      // Text overlay
      ctx.fillStyle = 'rgba(5,6,10,0.7)'
      ctx.fillRect(0, size - 50, size * 2, 50)
      ctx.fillStyle = '#00d4c8'
      ctx.font = 'bold 18px monospace'
      ctx.fillText(`NeuroScan AI  |  ${tumorClass.toUpperCase()}  |  ${Math.round(confidence * 100)}% confidence`, 16, size - 20)

      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url; a.download = `neuroscan_result_${tumorClass}.png`; a.click()
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-slate-200">
          Analysis Results
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface-700 hover:bg-surface-600 text-slate-300 border border-surface-500 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface-700 hover:bg-surface-600 text-slate-300 border border-surface-500 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Scan
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Visualisations */}
        <div className="space-y-4">
          <SegmentationCanvas
            imgEl={imgEl}
            maskData={maskData}
            tumorClass={tumorClass}
            imageSize={imageSize}
          />
          <MetricsDisplay stats={stats} confidence={confidence} tumorClass={tumorClass} />
        </div>

        {/* Right: Classification */}
        <div>
          <ClassificationPanel
            tumorClass={tumorClass}
            classification={classification}
            confidence={confidence}
            isDemo={isDemo}
          />
        </div>
      </div>
    </motion.div>
  )
}