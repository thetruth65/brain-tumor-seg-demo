// UploadZone.jsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImagePlus, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadZone({ onImageReady, onReset, hasResult }) {
  const [preview, setPreview] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [err, setErr] = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    setErr(null)
    if (rejected.length > 0) {
      setErr('Please upload a valid image file (JPEG, PNG, BMP, TIFF).')
      return
    }
    if (accepted.length === 0) return

    const file = accepted[0]
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' })

    const url = URL.createObjectURL(file)
    setPreview(url)

    const img = new Image()
    img.onload = () => onImageReady(img, url)
    img.src = url
  }, [onImageReady])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  })

  const handleReset = () => {
    setPreview(null)
    setFileInfo(null)
    setErr(null)
    onReset()
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative overflow-hidden cursor-pointer rounded-2xl
                border-2 border-dashed transition-all duration-300
                ${isDragActive
                  ? 'border-brand-cyan bg-surface-700 glow-cyan-strong scale-[1.01]'
                  : 'border-surface-500 bg-surface-800 hover:border-brand-cyan/50 hover:bg-surface-700'
                }
              `}
            >
              <input {...getInputProps()} />

              {/* Scan line effect when dragging */}
              {isDragActive && <div className="scan-line" />}

              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className={`
                  mb-5 w-20 h-20 rounded-2xl flex items-center justify-center
                  transition-all duration-300
                  ${isDragActive ? 'bg-brand-cyan/20 scale-110' : 'bg-surface-700'}
                `}>
                  {isDragActive
                    ? <ImagePlus className="w-10 h-10 text-brand-cyan" />
                    : <Upload className="w-10 h-10 text-slate-400" />
                  }
                </div>

                <h3 className="font-display text-lg font-semibold text-slate-200 mb-2">
                  {isDragActive ? 'Drop your MRI scan' : 'Upload MRI Scan'}
                </h3>
                <p className="font-body text-sm text-slate-500 mb-4 max-w-xs leading-relaxed">
                  Drag &amp; drop a brain MRI image, or click to browse.
                  Supports JPEG, PNG, BMP, TIFF.
                </p>

                <div className="flex gap-2 flex-wrap justify-center">
                  {['T1', 'T1ce', 'T2', 'FLAIR'].map(m => (
                    <span key={m} className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-surface-600 text-slate-400 border border-surface-500">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Corner decorations */}
              {[
                'top-3 left-3 border-t-2 border-l-2',
                'top-3 right-3 border-t-2 border-r-2',
                'bottom-3 left-3 border-b-2 border-l-2',
                'bottom-3 right-3 border-b-2 border-r-2',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-4 h-4 ${cls} border-brand-cyan/30 rounded-sm`} />
              ))}
            </div>

            {err && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {err}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-start gap-4 p-4">
              <div className="relative shrink-0">
                <img
                  src={preview}
                  alt="MRI preview"
                  className="w-20 h-20 object-cover rounded-xl border border-surface-500"
                />
                <div className="absolute inset-0 rounded-xl border border-brand-cyan/20" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-slate-200 truncate">
                  {fileInfo?.name}
                </p>
                <p className="font-mono text-xs text-slate-500 mt-0.5">{fileInfo?.size}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                  <span className="text-xs text-brand-cyan font-mono">Ready for analysis</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="shrink-0 p-1.5 rounded-lg hover:bg-surface-600 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}