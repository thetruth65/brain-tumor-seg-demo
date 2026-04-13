// postprocess.js — render mask overlays and compute display metrics

export const TUMOR_COLORS = {
  meningioma: { r: 245, g: 158, b: 11  },  // amber
  glioma:     { r: 239, g: 68,  b: 68  },  // red
  pituitary:  { r: 139, g: 92,  b: 246 },  // violet
  none:       { r: 16,  g: 185, b: 129 },  // emerald
}

export const CLASS_INFO = {
  meningioma: {
    label: 'Meningioma',
    description: 'Typically benign, arises from meninges',
    severity: 'moderate',
    color: '#f59e0b',
  },
  glioma: {
    label: 'Glioma',
    description: 'Arises from glial cells, can be high-grade',
    severity: 'high',
    color: '#ef4444',
  },
  pituitary: {
    label: 'Pituitary Tumor',
    description: 'Located in pituitary gland, usually benign',
    severity: 'low',
    color: '#8b5cf6',
  },
  none: {
    label: 'No Tumor',
    description: 'No significant tumor region detected',
    severity: 'none',
    color: '#10b981',
  },
}

/**
 * Draw the original MRI image onto a canvas
 */
export function drawImageOnCanvas(canvas, imgEl) {
  const ctx = canvas.getContext('2d')
  canvas.width = imgEl.naturalWidth || imgEl.width
  canvas.height = imgEl.naturalHeight || imgEl.height
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height)
}

/**
 * Render a coloured mask overlay onto a canvas
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} imgEl
 * @param {Uint8Array} maskData  — flat (H*W), values 0 or 1
 * @param {string} tumorClass
 * @param {number} alpha — overlay opacity
 */
export function drawMaskOverlay(canvas, imgEl, maskData, tumorClass = 'glioma', alpha = 0.5) {
  const H = 256, W = 256
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Draw base grayscale image
  ctx.drawImage(imgEl, 0, 0, W, H)
  const imgPixels = ctx.getImageData(0, 0, W, H)

  // Overlay mask
  const color = TUMOR_COLORS[tumorClass] || TUMOR_COLORS.glioma
  const out = ctx.createImageData(W, H)
  for (let i = 0; i < H * W; i++) {
    const src = i * 4
    if (maskData[i] === 1) {
      out.data[src]     = Math.round(color.r * alpha + imgPixels.data[src] * (1 - alpha))
      out.data[src + 1] = Math.round(color.g * alpha + imgPixels.data[src + 1] * (1 - alpha))
      out.data[src + 2] = Math.round(color.b * alpha + imgPixels.data[src + 2] * (1 - alpha))
      out.data[src + 3] = 255
    } else {
      out.data[src]     = imgPixels.data[src]
      out.data[src + 1] = imgPixels.data[src + 1]
      out.data[src + 2] = imgPixels.data[src + 2]
      out.data[src + 3] = 255
    }
  }
  ctx.putImageData(out, 0, 0)

  // Draw mask contour
  drawContour(ctx, maskData, W, H, color)
}

/**
 * Draw mask as a pure heatmap (no background)
 */
export function drawMaskHeatmap(canvas, maskData, tumorClass = 'glioma') {
  const H = 256, W = 256
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const color = TUMOR_COLORS[tumorClass] || TUMOR_COLORS.glioma
  const out = ctx.createImageData(W, H)
  for (let i = 0; i < H * W; i++) {
    const src = i * 4
    if (maskData[i] === 1) {
      out.data[src]     = color.r
      out.data[src + 1] = color.g
      out.data[src + 2] = color.b
      out.data[src + 3] = 220
    } else {
      out.data[src]     = 10
      out.data[src + 1] = 12
      out.data[src + 2] = 23
      out.data[src + 3] = 255
    }
  }
  ctx.putImageData(out, 0, 0)
}

/**
 * Draw contour lines around the mask boundary
 */
function drawContour(ctx, maskData, W, H, color) {
  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`
  ctx.lineWidth = 1.5

  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = y * W + x
      if (maskData[idx] === 1) {
        const isEdge =
          maskData[(y - 1) * W + x] === 0 ||
          maskData[(y + 1) * W + x] === 0 ||
          maskData[y * W + (x - 1)] === 0 ||
          maskData[y * W + (x + 1)] === 0
        if (isEdge) {
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }
}

/**
 * Compute simple mask statistics for display
 */
export function computeMaskStats(maskData, imageSize = 256) {
  const total = imageSize * imageSize
  let tumorPixels = 0
  let minX = imageSize, maxX = 0, minY = imageSize, maxY = 0

  for (let i = 0; i < total; i++) {
    if (maskData[i] === 1) {
      tumorPixels++
      const x = i % imageSize
      const y = Math.floor(i / imageSize)
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
  }

  const area = tumorPixels / total
  const bbox = tumorPixels > 0 ? {
    x: minX, y: minY,
    w: maxX - minX, h: maxY - minY,
    cx: Math.round((minX + maxX) / 2),
    cy: Math.round((minY + maxY) / 2),
  } : null

  return { tumorPixels, totalPixels: total, area, bbox }
}