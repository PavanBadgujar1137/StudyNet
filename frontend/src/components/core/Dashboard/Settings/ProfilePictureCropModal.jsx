import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  FiZoomIn,
  FiZoomOut,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiMove,
  FiCrop
} from "react-icons/fi"
import toast from "react-hot-toast"

const VIEWPORT_SIZE = 280
const OUTPUT_SIZE = 512

/**
 * ProfilePictureCropModal
 * Zero-dependency, responsive 1:1 image cropping modal with drag, zoom,
 * circular guide, live preview, and high-quality canvas export.
 */
export default function ProfilePictureCropModal({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
  isUploading = false,
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })

  const dragStartRef = useRef({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)
  const viewportRef = useRef(null)

  // Clamp pan so image always fully covers the viewport
  const clampPan = useCallback((x, y, currentZoom, dims) => {
    if (!dims.width || !dims.height) return { x: 0, y: 0 }
    const s0 = Math.max(VIEWPORT_SIZE / dims.width, VIEWPORT_SIZE / dims.height)
    const wRendered = dims.width * s0 * currentZoom
    const hRendered = dims.height * s0 * currentZoom

    const maxPanX = Math.max(0, (wRendered - VIEWPORT_SIZE) / 2)
    const maxPanY = Math.max(0, (hRendered - VIEWPORT_SIZE) / 2)

    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, x)),
      y: Math.min(maxPanY, Math.max(-maxPanY, y)),
    }
  }, [])

  // Reset state on new image
  const resetCrop = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      resetCrop()
    }
  }, [isOpen, imageSrc, resetCrop])

  // Handle image load to get natural dimensions
  const handleImageLoad = (e) => {
    const naturalWidth = e.target.naturalWidth || e.target.width
    const naturalHeight = e.target.naturalHeight || e.target.height
    setImgDimensions({ width: naturalWidth, height: naturalHeight })
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Pointer drag events (supports mouse and touch natively)
  const handlePointerDown = (e) => {
    if (isUploading) return
    if (e.button !== 0 && e.pointerType === "mouse") return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}
  }

  const handlePointerMove = (e) => {
    if (!isDragging || isUploading) return
    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y
    setPan(clampPan(newX, newY, zoom, imgDimensions))
  }

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch (_) {}
    }
  }

  // Wheel zoom
  const handleWheel = (e) => {
    if (isUploading) return
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setZoom((prev) => {
      const next = Math.min(3, Math.max(1, Math.round((prev + delta) * 100) / 100))
      return next
    })
  }

  // Re-clamp pan when zoom changes
  useEffect(() => {
    if (imgDimensions.width > 0 && imgDimensions.height > 0) {
      setPan((prev) => clampPan(prev.x, prev.y, zoom, imgDimensions))
    }
  }, [zoom, imgDimensions, clampPan])

  // Draw live 64x64 circular preview
  useEffect(() => {
    if (!previewCanvasRef.current || !imgRef.current || !imgDimensions.width) return
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const O = canvas.width
    ctx.clearRect(0, 0, O, O)

    const s0 = Math.max(VIEWPORT_SIZE / imgDimensions.width, VIEWPORT_SIZE / imgDimensions.height)
    const wRendered = imgDimensions.width * s0 * zoom
    const hRendered = imgDimensions.height * s0 * zoom

    const K = O / VIEWPORT_SIZE
    const dWidth = wRendered * K
    const dHeight = hRendered * K
    const dx = (O - dWidth) / 2 + pan.x * K
    const dy = (O - dHeight) / 2 + pan.y * K

    ctx.save()
    ctx.beginPath()
    ctx.arc(O / 2, O / 2, O / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(imgRef.current, dx, dy, dWidth, dHeight)
    ctx.restore()
  }, [pan, zoom, imgDimensions])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isUploading) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isUploading, onClose])

  if (!isOpen || !imageSrc) return null

  // Calculate rendered image styles
  const s0 = imgDimensions.width && imgDimensions.height
    ? Math.max(VIEWPORT_SIZE / imgDimensions.width, VIEWPORT_SIZE / imgDimensions.height)
    : 1
  const renderedWidth = imgDimensions.width * s0 * zoom
  const renderedHeight = imgDimensions.height * s0 * zoom
  const imgLeft = (VIEWPORT_SIZE - renderedWidth) / 2 + pan.x
  const imgTop = (VIEWPORT_SIZE - renderedHeight) / 2 + pan.y

  // Export cropped 512x512 JPEG File
  const handleConfirmCrop = async () => {
    if (!imgRef.current || !imgDimensions.width || isUploading) return
    try {
      const canvas = document.createElement("canvas")
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not initialize canvas context")

      const K = OUTPUT_SIZE / VIEWPORT_SIZE
      const dWidth = renderedWidth * K
      const dHeight = renderedHeight * K
      const dx = (OUTPUT_SIZE - dWidth) / 2 + pan.x * K
      const dy = (OUTPUT_SIZE - dHeight) / 2 + pan.y * K

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(imgRef.current, dx, dy, dWidth, dHeight)

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      })

      if (!blob) throw new Error("Failed to export image blob")

      const croppedFile = new File([blob], "profile-picture.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      })

      await onConfirm(croppedFile)
    } catch (err) {
      console.error("Profile picture crop error:", err)
      toast.error("Failed to crop image. Please try again.")
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div className="w-full max-w-[440px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-white max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <FiCrop size={16} />
            </div>
            <div>
              <h3 id="crop-modal-title" className="text-base font-bold text-slate-100">
                Crop Profile Picture
              </h3>
              <p className="text-xs text-slate-400">
                Drag to reposition • Zoom to frame your photo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close cropping dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="flex flex-col items-center gap-3">
          <div
            ref={viewportRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            style={{
              width: `${VIEWPORT_SIZE}px`,
              height: `${VIEWPORT_SIZE}px`,
              touchAction: "none",
            }}
            className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 select-none shadow-inner ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            title="Click and drag to reposition image"
          >
            {/* Hidden Source Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop source"
              onLoad={handleImageLoad}
              onError={() => toast.error("Could not load image for cropping")}
              style={{
                position: "absolute",
                width: `${renderedWidth}px`,
                height: `${renderedHeight}px`,
                left: `${imgLeft}px`,
                top: `${imgTop}px`,
                maxWidth: "none",
                pointerEvents: "none",
                userSelect: "none",
              }}
              draggable={false}
            />

            {/* Circular Vignette Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px dashed rgba(255, 255, 255, 0.8)",
                boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.65)",
                pointerEvents: "none",
              }}
            />

            {/* Center Crosshair / Drag hint */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                opacity: isDragging ? 0 : 0.45,
                transition: "opacity 0.2s ease",
              }}
            >
              <div className="flex items-center gap-1 text-[11px] font-medium text-white/80 bg-slate-950/60 px-2 py-0.5 rounded-full pointer-events-none">
                <FiMove size={11} /> Drag to adjust
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="w-full flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.1) * 100) / 100))}
              disabled={zoom <= 1 || isUploading}
              aria-label="Zoom out"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <FiZoomOut size={15} />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={isUploading}
              aria-label="Zoom slider"
              className="flex-1 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 100) / 100))}
              disabled={zoom >= 3 || isUploading}
              aria-label="Zoom in"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <FiZoomIn size={15} />
            </button>

            <span className="text-xs font-mono text-slate-400 min-w-[38px] text-right">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={resetCrop}
              disabled={isUploading || (zoom === 1 && pan.x === 0 && pan.y === 0)}
              aria-label="Reset crop"
              title="Reset position & zoom"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <FiRefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Live Circular Preview Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <canvas
            ref={previewCanvasRef}
            width={64}
            height={64}
            className="w-14 h-14 rounded-full ring-2 ring-indigo-500/60 shadow-md shrink-0 bg-slate-800"
          />
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-bold text-slate-200 block">Live Preview</span>
            <p className="text-[11px] text-slate-400 leading-tight">
              This is how your profile picture will appear across the platform.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isUploading || !imgDimensions.width}
            style={{
              background: "linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)",
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <FiCheck size={14} />
                <span>Confirm &amp; Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
