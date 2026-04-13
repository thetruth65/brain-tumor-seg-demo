// demoMode.js — generates realistic-looking segmentation results for demo/presentation

/**
 * Create a synthetic elliptical mask for demo purposes
 */
export function generateDemoMask(imgEl, tumorClass) {
  const H = 256, W = 256
  const mask = new Uint8Array(H * W)

  // Different shapes per tumor type
  const configs = {
    meningioma: { cx: 0.65, cy: 0.25, rx: 0.12, ry: 0.10 },
    glioma:     { cx: 0.40, cy: 0.45, rx: 0.18, ry: 0.14 },
    pituitary:  { cx: 0.50, cy: 0.60, rx: 0.07, ry: 0.09 },
    none:       null,
  }

  const cfg = configs[tumorClass]
  if (!cfg) return mask

  const cx = cfg.cx * W, cy = cfg.cy * H
  const rx = cfg.rx * W, ry = cfg.ry * H

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      // Slightly irregular ellipse with noise
      const noise = 0.15 * Math.sin(x * 0.3) * Math.cos(y * 0.25)
      if (dx * dx + dy * dy < (1 + noise)) {
        mask[y * W + x] = 1
      }
    }
  }
  return mask
}

/**
 * Simulate classification probabilities
 */
export function generateDemoClassification(tumorClass) {
  const classes = ['meningioma', 'glioma', 'pituitary', 'none']
  const probs = {}

  if (tumorClass === 'none') {
    probs.none = 0.88 + Math.random() * 0.08
    classes.filter(c => c !== 'none').forEach(c => {
      probs[c] = (1 - probs.none) * Math.random()
    })
  } else {
    probs[tumorClass] = 0.75 + Math.random() * 0.18
    const rest = 1 - probs[tumorClass]
    classes.filter(c => c !== tumorClass).forEach(c => {
      probs[c] = rest * Math.random()
    })
  }

  // Normalize
  const total = Object.values(probs).reduce((a, b) => a + b, 0)
  Object.keys(probs).forEach(k => { probs[k] = probs[k] / total })
  return probs
}

const DEMO_CLASSES = ['meningioma', 'glioma', 'pituitary', 'none']

export async function runDemoInference(imgEl, onProgress) {
  // Simulate processing delay
  onProgress?.('Preprocessing image…')
  await delay(600)
  onProgress?.('Running EfficientNetV2-S encoder…')
  await delay(800)
  onProgress?.('UNet decoder pass…')
  await delay(700)
  onProgress?.('Postprocessing mask…')
  await delay(400)

  // Pick a random (non-none) class for demo
  const idx = Math.floor(Math.random() * 3)
  const tumorClass = DEMO_CLASSES[idx]
  const maskData = generateDemoMask(imgEl, tumorClass)
  const classification = generateDemoClassification(tumorClass)
  const confidence = 0.78 + Math.random() * 0.15

  return {
    maskData,
    hasTumor: tumorClass !== 'none',
    confidence,
    tumorClass,
    classification,
    isDemo: true,
    imageSize: 256,
    tumorPixelRatio: maskData.filter(v => v === 1).length / (256 * 256),
  }
}

const delay = (ms) => new Promise(r => setTimeout(r, ms))