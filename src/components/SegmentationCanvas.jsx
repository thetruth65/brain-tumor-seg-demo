// SegmentationCanvas.jsx
import { useEffect, useRef, useState } from 'react'
import { drawMaskOverlay, drawMaskHeatmap, drawImageOnCanvas } from '../lib/postprocess'
import { Layers, Eye, EyeOff, Sliders } from 'lucide-react'
import { motion } from 'framer-motion'

const VIEWS = ['Original', 'Overlay', 'Mask']

export default function SegmentationCanvas({ imgEl, maskData, tumorClass, imageSize = 256 }) {
  const origRef  = useRef(null)
  const overlayRef = useRef(null)
  const maskRef  = useRef(null)
  const [alpha, setAlpha] = useState(0.5)
  const [activeView, setActiveView] = useState('Overlay')

  useEffect(() => {
    if (!imgEl || !maskData) return

    if (origRef.current)    drawImageOnCanvas(origRef.current, imgEl)
    if (overlayRef.current) drawMaskOverlay(overlayRef.current, imgEl, maskData, tumorClass, alpha)
    if (maskRef.current)    drawMaskHeatmap(maskRef.current, maskData, tumorClass)
  }, [imgEl, maskData, tumorClass, alpha])

  const currentRef = { Original: origRef, Overlay: overlayRef, Mask: maskRef }[activeView]

  return (
    <div className="space-y-3">
      {/* View switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <Layers className="w-3.5 h-3.5" />
          {imageSize}×{imageSize} px
        </div>
        <div className="flex rounded-lg overflow-hidden border border-surface-500 bg-surface-800">
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 text-xs font-mono transition-all duration-200
                ${activeView === v
                  ? 'bg-brand-cyan text-surface-900 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700'
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas display */}
      <div className="relative rounded-xl overflow-hidden bg-surface-900 border border-surface-600">
        {/* All canvases always rendered (for effect hook), only one shown */}
        <div className={activeView === 'Original' ? '' : 'hidden'}>
          <canvas ref={origRef} className="w-full aspect-square object-contain" />
        </div>
        <div className={activeView === 'Overlay' ? '' : 'hidden'}>
          <canvas ref={overlayRef} className="w-full aspect-square object-contain" />
        </div>
        <div className={activeView === 'Mask' ? '' : 'hidden'}>
          <canvas ref={maskRef} className="w-full aspect-square object-contain" />
        </div>

        {/* Corner frame */}
        {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r',
          'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((cls, i) => (
          <div key={i} className={`absolute w-5 h-5 ${cls} border-brand-cyan/40 rounded-sm pointer-events-none`} />
        ))}

        {/* View label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-surface-900/80 backdrop-blur border border-surface-600 text-xs font-mono text-slate-400">
          {activeView === 'Original' && 'CE-MRI Input'}
          {activeView === 'Overlay' && 'Tumor Segmentation'}
          {activeView === 'Mask' && 'Predicted Mask'}
        </div>
      </div>

      {/* Opacity slider (only in overlay mode) */}
      {activeView === 'Overlay' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-3 px-1"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs font-mono text-slate-500 w-20">Overlay α</span>
          <input
            type="range" min="0.1" max="0.9" step="0.05"
            value={alpha}
            onChange={e => setAlpha(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs font-mono text-brand-cyan w-8 text-right">
            {Math.round(alpha * 100)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}