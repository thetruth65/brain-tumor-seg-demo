import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import LoadingOverlay from './components/LoadingOverlay'
import ResultsPanel from './components/ResultsPanel'
import { useInference, STAGES } from './hooks/useInference'

export default function App() {
  const [imgEl, setImgEl] = useState(null)
  const { stage, progress, result, error, useDemo, infer, reset } = useInference()

  const handleImageReady = useCallback((img, _url) => {
    setImgEl(img)
    infer(img)
  }, [infer])

  const handleReset = () => { reset(); setImgEl(null) }

  return (
    <div className="min-h-screen bg-surface-900 bg-grid-pattern bg-grid relative">
      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-violet/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <Header />

        <main className="space-y-6">
          <motion.div layout className="glass-heavy rounded-2xl p-6">
            <UploadZone
              onImageReady={handleImageReady}
              onReset={handleReset}
              hasResult={!!result}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {stage === STAGES.LOADING && (
              <LoadingOverlay key="loading" progress={progress} />
            )}
            {stage === STAGES.ERROR && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 text-center text-red-400 font-mono text-sm"
              >
                ⚠ {error}
              </motion.div>
            )}
            {stage === STAGES.DONE && result && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ResultsPanel imgEl={imgEl} result={result} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}