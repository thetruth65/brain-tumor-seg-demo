// onnxInference.js
// import { InferenceSession, Tensor, env } from 'onnxruntime-web'
import * as ort from 'onnxruntime-web'


let session = null
const MODEL_PATH = `${import.meta.env.BASE_URL}model.onnx`
const IMAGE_SIZE = 256

/**
 * Check if model.onnx is reachable (byte-range GET, avoids HEAD 404 on Vite)
 */
export async function isModelAvailable() {
  try {
    const res = await fetch(MODEL_PATH, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
    })
    return res.ok || res.status === 206
  } catch {
    return false
  }
}

/**
 * Load and cache the ONNX session
 */
export async function loadModel(onProgress) {
  if (session) return session
  onProgress?.('Loading model weights…')

  // Configure WASM paths here — NOT at module top level
  // (ort.env is undefined until the module is fully initialised)
//   ort.env.wasm.wasmPaths  = `${import.meta.env.BASE_URL}`
//   ort.env.wasm.numThreads = 1

  try {
    session = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    })
    onProgress?.('Model ready')
    return session
  } catch (err) {
    session = null
    console.error('ONNX loadModel error:', err)
    throw new Error(
      `Could not load ONNX model from ${MODEL_PATH}. ` +
      'Make sure public/model.onnx exists and the runtime can fetch it.'
    )
  }
}

/**
 * Preprocess HTMLImageElement → Float32Array tensor (1, 3, 256, 256)
 */
export function preprocessImage(imgEl) {
  const canvas = document.createElement('canvas')
  canvas.width  = IMAGE_SIZE
  canvas.height = IMAGE_SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imgEl, 0, 0, IMAGE_SIZE, IMAGE_SIZE)

  const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
  const N      = IMAGE_SIZE * IMAGE_SIZE
  const tensor = new Float32Array(3 * N)

  for (let i = 0; i < N; i++) {
    const gray = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255.0
    tensor[i]         = gray
    tensor[N + i]     = gray
    tensor[2 * N + i] = gray
  }
  return tensor
}

/**
 * Run segmentation inference
 */
export async function runInference(imgEl, onProgress) {
  const sess = await loadModel(onProgress)
  onProgress?.('Preprocessing image…')

  const floatArr   = preprocessImage(imgEl)
  const inputTensor = new ort.Tensor('float32', floatArr, [1, 3, IMAGE_SIZE, IMAGE_SIZE])


  onProgress?.('Running EfficientNetV2-S + UNet…')
  const feeds  = { [sess.inputNames[0]]: inputTensor }
  const results = await sess.run(feeds)

  const outputData = results[sess.outputNames[0]].data  // Float32Array (1,2,H,W)
  const H = IMAGE_SIZE, W = IMAGE_SIZE

  const maskData = new Uint8Array(H * W)
  let totalConfidence = 0
  let tumorPixels     = 0

  for (let i = 0; i < H * W; i++) {
    const logit0 = outputData[i]
    const logit1 = outputData[H * W + i]
    const maxL   = Math.max(logit0, logit1)
    const e0     = Math.exp(logit0 - maxL)
    const e1     = Math.exp(logit1 - maxL)
    const p1     = e1 / (e0 + e1)

    maskData[i] = p1 > 0.5 ? 1 : 0
    if (maskData[i] === 1) { totalConfidence += p1; tumorPixels++ }
  }

  const confidence = tumorPixels > 0 ? totalConfidence / tumorPixels : 0
  const hasTumor   = tumorPixels > H * W * 0.002

  onProgress?.('Postprocessing…')
  const processed = largestConnectedComponent(maskData, H, W)

  return {
    maskData: processed,
    confidence: hasTumor ? confidence : 0,
    hasTumor,
    tumorPixelRatio: tumorPixels / (H * W),
    imageSize: IMAGE_SIZE,
  }
}

function largestConnectedComponent(mask, H, W) {
  const visited = new Uint8Array(H * W)
  const labels  = new Int32Array(H * W).fill(-1)
  let bestSize = 0, bestLabel = -1, labelCount = 0

  for (let idx = 0; idx < H * W; idx++) {
    if (mask[idx] !== 1 || visited[idx]) continue
    const queue     = [idx]
    const component = [idx]
    visited[idx]    = 1
    labels[idx]     = labelCount

    while (queue.length > 0) {
      const cur = queue.shift()
      const row = Math.floor(cur / W), col = cur % W
      for (const nb of [
        row > 0     ? cur - W : -1,
        row < H - 1 ? cur + W : -1,
        col > 0     ? cur - 1 : -1,
        col < W - 1 ? cur + 1 : -1,
      ]) {
        if (nb >= 0 && mask[nb] === 1 && !visited[nb]) {
          visited[nb] = 1; labels[nb] = labelCount
          queue.push(nb); component.push(nb)
        }
      }
    }
    if (component.length > bestSize) { bestSize = component.length; bestLabel = labelCount }
    labelCount++
  }

  const result = new Uint8Array(H * W)
  if (bestLabel >= 0)
    for (let i = 0; i < H * W; i++)
      result[i] = labels[i] === bestLabel ? 1 : 0
  return result
}