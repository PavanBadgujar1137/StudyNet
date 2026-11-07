import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiMove,
  FiCrop
} from 'react-icons/fi'

const ASPECT_RATIOS = [
  { id: '16/9', label: '16:9 (Course Thumbnail)', ratio: 16 / 9, width: 1280, height: 720 },
  { id: '4/3', label: '4:3 (Standard Card)', ratio: 4 / 3, width: 960, height: 720 },
  { id: '1/1', label: '1:1 (Square)', ratio: 1 / 1, width: 800, height: 800 },
  { id: 'original', label: 'Original Ratio', ratio: null, width: null, height: null },
]

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  originalFile,
  onCropComplete,
  onClose,
  defaultAspect = '16/9',
}) {
  const [selectedRatioId, setSelectedRatioId] = useState(defaultAspect)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageElement, setImageElement] = useState(null)
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 })

  const previewCanvasRef = useRef(null)
  const containerRef = useRef(null)

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc || !isOpen) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageElement(img)
      setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      setZoom(1)
      setRotation(0)
      setPan({ x: 0, y: 0 })
      setSelectedRatioId(defaultAspect)
    }
    img.src = imageSrc
  }, [imageSrc, isOpen, defaultAspect])

  // Get active aspect ratio
  const activeRatioConfig = ASPECT_RATIOS.find((r) => r.id === selectedRatioId) || ASPECT_RATIOS[0]
  const targetRatio =
    activeRatioConfig.ratio || (imgNaturalSize.width && imgNaturalSize.height ? imgNaturalSize.width / imgNaturalSize.height : 16 / 9)

  // Draw interactive crop canvas
  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current
    if (!canvas || !imageElement) return

    const ctx = canvas.getContext('2d')
    const containerWidth = containerRef.current ? Math.min(containerRef.current.clientWidth - 40, 680) : 560
    const canvasWidth = containerWidth
    const canvasHeight = Math.round(canvasWidth / targetRatio)

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Save state for transform
    ctx.save()

    // Move origin to center of canvas
    ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y)

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)

    // Apply zoom & scaling
    const isRotated90or270 = rotation % 180 !== 0
    const effectiveImgW = isRotated90or270 ? imgNaturalSize.height : imgNaturalSize.width
    const effectiveImgH = isRotated90or270 ? imgNaturalSize.width : imgNaturalSize.height

    const scale = Math.max(canvasWidth / effectiveImgW, canvasHeight / effectiveImgH) * zoom

    const drawW = imgNaturalSize.width * scale
    const drawH = imgNaturalSize.height * scale

    ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    // Draw Rule of Thirds Grid Guidelines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])

    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(canvasWidth / 3, 0)
    ctx.lineTo(canvasWidth / 3, canvasHeight)
    ctx.moveTo((canvasWidth * 2) / 3, 0)
    ctx.lineTo((canvasWidth * 2) / 3, canvasHeight)
    // Horizontal lines
    ctx.moveTo(0, canvasHeight / 3)
    ctx.lineTo(canvasWidth, canvasHeight / 3)
    ctx.moveTo(0, (canvasHeight * 2) / 3)
    ctx.lineTo(canvasWidth, (canvasHeight * 2) / 3)
    ctx.stroke()
    ctx.setLineDash([])

    // Border
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight)
  }, [imageElement, imgNaturalSize, targetRatio, zoom, rotation, pan])

  useEffect(() => {
    drawPreview()
  }, [drawPreview])

  // Mouse & Touch Pan Handling
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch support for mobile/tablets
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  // Reset controls
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPan({ x: 0, y: 0 })
  }

  // Generate cropped output File
  const handleApplyCrop = async () => {
    if (!imageElement) return

    const exportW = activeRatioConfig.width || 1280
    const exportH = activeRatioConfig.height || Math.round(exportW / targetRatio)

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = exportW
    exportCanvas.height = exportH
    const ctx = exportCanvas.getContext('2d')

    // Quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Compute ratio between preview canvas and export canvas
    const previewW = previewCanvasRef.current ? previewCanvasRef.current.width : exportW
    const scaleFactor = exportW / previewW

    ctx.save()
    ctx.translate(exportW / 2 + pan.x * scaleFactor, exportH / 2 + pan.y * scaleFactor)
    ctx.rotate((rotation * Math.PI) / 180)

    const isRotated90or270 = rotation % 180 !== 0
    const effectiveImgW = isRotated90or270 ? imgNaturalSize.height : imgNaturalSize.width
    const effectiveImgH = isRotated90or270 ? imgNaturalSize.width : imgNaturalSize.height

    const scale = Math.max(exportW / effectiveImgW, exportH / effectiveImgH) * zoom

    const drawW = imgNaturalSize.width * scale
    const drawH = imgNaturalSize.height * scale

    ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return
        const fileName = (originalFile?.name || 'course-thumbnail').replace(/\.[^/.]+$/, '') + '-cropped.jpg'
        const croppedFile = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        const previewUrl = URL.createObjectURL(blob)
        onCropComplete(croppedFile, previewUrl)
        onClose()
      },
      'image/jpeg',
      0.92
    )
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={containerRef}
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiCrop size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Crop &amp; Frame Thumbnail
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                Drag image to reposition • Adjust zoom &amp; aspect ratio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div
          style={{
            padding: '12px 24px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginRight: '4px' }}>
            Preset:
          </span>
          {ASPECT_RATIOS.map((item) => {
            const isSelected = selectedRatioId === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedRatioId(item.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  background: isSelected ? '#EFF6FF' : '#FFFFFF',
                  color: isSelected ? '#1D4ED8' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Interactive Canvas Viewport */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            userSelect: 'none',
            minHeight: '280px',
          }}
        >
          <canvas
            ref={previewCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              maxWidth: '100%',
              display: 'block',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          >
            <FiMove size={12} /> Drag inside frame to pan
          </div>
        </div>

        {/* Controls Footer (Zoom, Rotate, Reset, Apply) */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Zoom and Rotate controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {/* Zoom Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.1).toFixed(1))))}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FiZoomOut size={16} />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#2563EB', cursor: 'pointer' }}
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.1).toFixed(1))))}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FiZoomIn size={16} />
              </button>

              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '38px', textAlign: 'right' }}>
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Actions (Rotate & Reset) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiRotateCw size={13} /> Rotate 90°
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiRefreshCw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyCrop}
              style={{
                padding: '9px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              <FiCheck size={16} /> Apply Crop &amp; Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
