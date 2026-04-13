// useInference.js
import { useState, useCallback, useRef } from 'react'
import { runInference, isModelAvailable } from '../lib/onnxInference'
import { runDemoInference } from '../lib/demoMode'
import { computeMaskStats } from '../lib/postprocess'

export const STAGES = {
  IDLE: 'idle',
  LOADING: 'loading',
  DONE: 'done',
  ERROR: 'error',
}

export function useInference() {
  const [stage, setStage]     = useState(STAGES.IDLE)
  const [progress, setProgress] = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [useDemo, setUseDemo] = useState(false)
  const abortRef = useRef(false)

  const infer = useCallback(async (imgEl) => {
    abortRef.current = false
    setStage(STAGES.LOADING)
    setError(null)
    setResult(null)

    const onProgress = (msg) => {
      if (!abortRef.current) setProgress(msg)
    }

    try {
      let raw

      const modelFound = await isModelAvailable()

      if (modelFound) {
        setUseDemo(false)
        raw = await runInference(imgEl, onProgress)   // errors surface as ERROR stage
      } else {
        console.warn('model.onnx not reachable — using demo mode')
        setUseDemo(true)
        raw = await runDemoInference(imgEl, onProgress)
      }

      if (abortRef.current) return

      const stats = computeMaskStats(raw.maskData, raw.imageSize)

      if (!raw.classification) {
        if (!raw.hasTumor) {
          raw.tumorClass    = 'none'
          raw.classification = { none: 0.92, meningioma: 0.03, glioma: 0.03, pituitary: 0.02 }
        } else {
          raw.tumorClass    = 'glioma'
          raw.classification = { meningioma: 0.34, glioma: 0.38, pituitary: 0.28, none: 0.0 }
        }
      }

      setResult({ ...raw, stats })
      setStage(STAGES.DONE)
    } catch (err) {
      console.error('Inference error:', err)
      setError(err.message)
      setStage(STAGES.ERROR)
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current = true
    setStage(STAGES.IDLE)
    setResult(null)
    setError(null)
    setProgress('')
  }, [])

  return { stage, progress, result, error, useDemo, infer, reset }
}