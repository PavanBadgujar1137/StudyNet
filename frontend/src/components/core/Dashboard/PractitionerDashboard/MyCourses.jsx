import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  FiBookOpen, FiPlus, FiVideo, FiUpload, FiTrash2,
  FiUsers, FiClock, FiX, FiEdit2, FiPlay, FiEdit3,
  FiChevronDown, FiChevronUp, FiGlobe, FiRefreshCw,
  FiMove, FiArrowUp, FiArrowDown, FiAlertTriangle
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

function formatDuration(secs) {
  if (!secs || secs <= 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = String(url).match(regExp)
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : null
}

function getVideoDuration(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(0)
    try {
      const videoElement = document.createElement('video')
      videoElement.preload = 'metadata'

      const timer = setTimeout(() => {
        resolve(0)
      }, 5000)

      const handleMeta = () => {
        clearTimeout(timer)
        const dur = Math.round(videoElement.duration || 0)
        try { window.URL.revokeObjectURL(videoElement.src) } catch (e) {}
        resolve(isNaN(dur) ? 0 : dur)
      }

      videoElement.onloadedmetadata = handleMeta
      videoElement.ondurationchange = handleMeta
      videoElement.oncanplay = handleMeta
      videoElement.onerror = () => {
        clearTimeout(timer)
        resolve(0)
      }
      videoElement.src = URL.createObjectURL(file)
    } catch (e) {
      resolve(0)
    }
  })
}

// ─── Professional Delete Confirmation Modal with Checkbox ────────────────────
function DeleteConfirmModal({ isOpen, title, itemName, itemType, warningText, onConfirm, onCancel, loading }) {
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (isOpen) setConfirmed(false)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 480,
        padding: '28px 28px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Header Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FiAlertTriangle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
              {title || `Delete ${itemType === 'course' ? 'Course' : 'Video'}`}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748B', lineHeight: 1.4, wordBreak: 'break-word' }}>
              Are you sure you want to permanently delete <strong style={{ color: '#0F172A' }}>"{itemName}"</strong>?
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: loading ? 'not-allowed' : 'pointer',
              flexShrink: 0
            }}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Warning Box */}
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 18,
          fontSize: 12.5,
          color: '#991B1B',
          lineHeight: 1.5
        }}>
          {warningText || (
            itemType === 'course'
              ? 'This will permanently remove this course and all associated videos, assets, and learner progression records. This action cannot be undone.'
              : 'This video will be permanently removed from this course. Learners will no longer be able to view or stream it. This action cannot be undone.'
          )}
        </div>

        {/* Mandatory Confirmation Checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          background: '#F8FAFC',
          border: confirmed ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
          borderRadius: 12,
          padding: '12px 14px',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: 22,
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={loading}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: '#DC2626', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500, lineHeight: 1.45 }}>
            Yes, I confirm that I want to delete this {itemType === 'course' ? 'course' : 'video'} and understand that this action cannot be undone.
          </span>
        </label>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 16px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              color: '#475569',
              fontWeight: 600,
              fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || loading}
            style={{
              flex: 1.4,
              padding: '11px 16px',
              background: !confirmed || loading ? '#FCA5A5' : 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: 'none',
              borderRadius: 10,
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              cursor: !confirmed || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: confirmed && !loading ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <FiTrash2 size={14} />
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Video Preview Modal ──────────────────────────────────────────────────────
function VideoPreviewModal({ video, courseId, onClose, onUpdate }) {
  const { token } = useSelector(s => s.auth)
  const videoRef = useRef()
  const [savingDuration, setSavingDuration] = useState(false)
  const ytEmbedUrl = getYouTubeEmbedUrl(video?.videoUrl)

  const handleLoadedMetadata = async (e) => {
    const dur = Math.round(e.target.duration || 0)
    if (dur > 0 && (!video.durationSeconds || video.durationSeconds === 0)) {
      try {
        setSavingDuration(true)
        await apiConnector('PUT', `/api/v1/courses/${courseId}/videos/${video._id}`, { durationSeconds: dur }, { Authorization: `Bearer ${token}` })
        video.durationSeconds = dur
        toast.success(`Video duration saved: ${formatDuration(dur)}`)
        if (onUpdate) onUpdate()
      } catch (err) {
        console.error('Failed to auto-save video duration', err)
      } finally {
        setSavingDuration(false)
      }
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)' }}>
        <div>
          <div style={{ color: '#3B82F6', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Practitioner Video Preview</div>
          <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 16, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {video?.title}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9', cursor: 'pointer' }}>
          <FiX size={18} />
        </button>
      </div>

      {/* Video Player */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '920px', aspectRatio: '16/9', background: '#000', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {ytEmbedUrl ? (
            <iframe
              src={ytEmbedUrl}
              title={video.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video?.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              controls
              autoPlay
              onLoadedMetadata={handleLoadedMetadata}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          ) : (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: 20 }}>
              <FiVideo size={48} style={{ marginBottom: 12 }} />
              <div>No video stream URL available</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ color: '#CBD5E1', fontSize: 13, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {video?.description || 'No description provided.'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: 12, flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 20, color: '#F1F5F9', fontWeight: 600 }}>
            <FiClock size={13} color="#3B82F6" /> Length: {formatDuration(video?.durationSeconds)} {savingDuration && '(Auto-saving...)'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Video Upload Card (Direct-to-S3 via Presigned URL) ─────────────────────
function VideoUploadForm({ courseId, onSuccess, onCancel }) {
  const { token } = useSelector(s => s.auth)
  const [form, setForm] = useState({ title: '', description: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [customDuration, setCustomDuration] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('') // 'presigning' | 's3' | 'confirming' | ''
  const videoInputRef = useRef()
  const xhrRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoUrlInput('')
      const dur = await getVideoDuration(file)
      if (dur > 0) setCustomDuration(String(dur))
    }
  }

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    onCancel()
  }

  const handleUpload = async () => {
    if (!form.title.trim()) return toast.error('Video title is required')
    if (!videoFile && !videoUrlInput.trim()) return toast.error('Please upload a video file or enter a video URL')

    setUploading(true)
    setProgress(0)

    try {
      if (!videoFile) {
        setPhase('confirming')
        setProgress(50)
        const res = await apiConnector(
          'POST',
          `/api/v1/courses/${courseId}/videos`,
          { title: form.title, description: form.description, videoUrl: videoUrlInput.trim(), durationSeconds: Number(customDuration) || 0 },
          { Authorization: `Bearer ${token}` }
        )
        setProgress(100)
        if (res?.data?.success) {
          toast.success('Video link added successfully!')
          onSuccess()
        } else {
          toast.error(res?.data?.message || 'Failed to add video')
        }
        return
      }

      setPhase('presigning')
      setProgress(2)
      let finalDuration = Number(customDuration) || 0
      if (!finalDuration) finalDuration = await getVideoDuration(videoFile)

      const presignRes = await apiConnector(
        'POST',
        `/api/v1/courses/${courseId}/videos/presign`,
        { fileName: videoFile.name, contentType: videoFile.type || 'video/mp4' },
        { Authorization: `Bearer ${token}` }
      )

      if (!presignRes?.data?.success) {
        throw new Error(presignRes?.data?.message || 'Failed to get upload URL')
      }

      const { presignedUrl, publicUrl, key } = presignRes.data

      setPhase('s3')
      setProgress(5)

      const uploadToS3 = () =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRef.current = xhr

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round(5 + (e.loaded / e.total) * 85)
              setProgress(pct)
            }
          }

          xhr.onload = () => {
            xhrRef.current = null
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error(`S3 upload failed (HTTP ${xhr.status})`))
          }

          xhr.onerror = () => {
            xhrRef.current = null
            reject(new Error('S3_CORS'))
          }

          xhr.onabort = () => {
            xhrRef.current = null
            reject(new Error('Upload cancelled'))
          }

          xhr.open('PUT', presignedUrl)
          xhr.send(videoFile)
        })

      const uploadViaApi = async () => {
        const fd = new FormData()
        fd.append('title', form.title.slice(0, 100))
        fd.append('description', form.description.slice(0, 500))
        fd.append('durationSeconds', String(finalDuration))
        fd.append('video', videoFile)
        const res = await apiConnector(
          'POST',
          `/api/v1/courses/${courseId}/videos`,
          fd,
          { Authorization: `Bearer ${token}` },
          null,
          {
            onUploadProgress: (e) => {
              if (e.total) setProgress(Math.round(5 + (e.loaded / e.total) * 90))
            },
          }
        )
        if (!res?.data?.success) {
          throw new Error(res?.data?.message || 'Server upload failed')
        }
      }

      let usedDirectS3 = true
      try {
        await uploadToS3()
      } catch (s3Err) {
        if (s3Err.message === 'Upload cancelled') throw s3Err
        usedDirectS3 = false
        await uploadViaApi()
      }

      if (usedDirectS3) {
        setPhase('confirming')
        setProgress(95)
        const confirmRes = await apiConnector(
          'POST',
          `/api/v1/courses/${courseId}/videos/confirm`,
          {
            title: form.title.slice(0, 100),
            description: form.description.slice(0, 500),
            videoUrl: publicUrl,
            key,
            durationSeconds: finalDuration,
          },
          { Authorization: `Bearer ${token}` }
        )
        if (!confirmRes?.data?.success) {
          throw new Error(confirmRes?.data?.message || 'Upload confirmation failed')
        }
      }

      setProgress(100)
      toast.success('Video uploaded successfully!')
      onSuccess()
    } catch (e) {
      if (e.message !== 'Upload cancelled') {
        toast.error('Upload failed: ' + (e.message || 'Unknown error'))
      }
    } finally {
      setUploading(false)
      setProgress(0)
      setPhase('')
    }
  }

  const phaseLabel = {
    presigning: 'Preparing upload...',
    s3: 'Uploading to cloud...',
    confirming: 'Saving video record...',
  }[phase] || 'Uploading...'

  return (
    <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: 14, padding: 20, marginTop: 12 }}>
      <h4 style={{ margin: '0 0 16px', color: '#1E293B', fontSize: 14, fontWeight: 700 }}>Add New Video</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Video Title *</label>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{form.title.length}/100</span>
          </div>
          <input
            value={form.title}
            maxLength={100}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to Mindfulness"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Description (optional)</label>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{form.description.length}/500</span>
          </div>
          <textarea
            value={form.description}
            maxLength={500}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="What will learners learn in this video?"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#1E293B', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Video File</label>
          <div onClick={() => videoInputRef.current?.click()}
            style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: videoFile ? '#F0FDF4' : '#F8FAFC', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}
          >
            <FiVideo size={24} color={videoFile ? '#10B981' : '#94A3B8'} style={{ marginBottom: 8 }} />
            {videoFile ? (
              <div>
                <div style={{ color: '#10B981', fontWeight: 600, fontSize: 14 }}>{videoFile.name}</div>
                <div style={{ color: '#64748B', fontSize: 12 }}>{(videoFile.size / 1024 / 1024).toFixed(1)} MB {customDuration > 0 && `• ${formatDuration(customDuration)}`}</div>
              </div>
            ) : (
              <div>
                <div style={{ color: '#64748B', fontSize: 14 }}>Click to select video file</div>
                <div style={{ color: '#94A3B8', fontSize: 12 }}>MP4, MOV, AVI, MKV (max 20GB) — uploads directly to cloud</div>
              </div>
            )}
          </div>
          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }}
            onChange={handleFileChange} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <span style={{ margin: '0 10px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Video URL (YouTube or Direct Link)</label>
          <input
            type="url"
            value={videoUrlInput}
            onChange={e => { setVideoUrlInput(e.target.value); if (e.target.value) setVideoFile(null) }}
            placeholder="https://www.youtube.com/watch?v=... or video link"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Video Duration (in seconds, optional)</label>
            {customDuration > 0 && <span style={{ fontSize: 11, color: '#3B82F6', fontWeight: 600 }}>Formatted: {formatDuration(customDuration)}</span>}
          </div>
          <input
            type="number"
            min="0"
            value={customDuration}
            onChange={e => setCustomDuration(e.target.value)}
            placeholder="e.g. 180 for 3 minutes (auto-detected from file)"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {uploading && (
          <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>
              <span>{phaseLabel}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ background: '#BFDBFE', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                background: phase === 'confirming' ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #6366F1)',
                height: '100%',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
                borderRadius: 4,
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
              {phase === 's3' && videoFile && `${(videoFile.size / 1024 / 1024).toFixed(0)} MB — uploading directly to cloud storage`}
              {phase === 'confirming' && 'Almost done — saving your video...'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCancel} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: 8, color: '#64748B', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {uploading ? 'Cancel Upload' : 'Cancel'}
          </button>
          <button onClick={handleUpload} disabled={uploading}
            style={{ flex: 2, padding: '10px', background: uploading ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 8, color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiUpload /> {uploading ? phaseLabel : 'Upload Video'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Course Modal ────────────────────────────────────────────────────────
function EditCourseModal({ course, onClose, onSuccess }) {
  const { token } = useSelector(s => s.auth)
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    price: course.price || 0,
    isFree: course.isFree !== undefined ? course.isFree : true,
    tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''),
    status: course.status || 'draft',
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [updating, setUpdating] = useState(false)
  const thumbRef = useRef()

  const handleUpdate = async () => {
    if (!form.title.trim()) return toast.error('Course title is required')
    setUpdating(true)

    try {
      const fd = new FormData()
      fd.append('title', form.title.slice(0, 100))
      fd.append('description', form.description.slice(0, 500))
      fd.append('status', form.status)
      fd.append('isFree', form.isFree)
      fd.append('price', form.isFree ? 0 : form.price)
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      if (thumbnail) fd.append('thumbnail', thumbnail)

      const res = await apiConnector('PUT', `/api/v1/courses/${course._id}`, fd, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      })

      if (res?.data?.success) {
        toast.success('Course updated successfully!')
        onSuccess()
      } else {
        toast.error(res?.data?.message || 'Update failed')
      }
    } catch (e) {
      toast.error('Could not update course: ' + (e.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          width: '100%',
          maxWidth: 560,
          maxHeight: 'min(90vh, 780px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #F1F5F9', position: 'relative', flexShrink: 0 }}>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#1E293B' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B' }}
          >
            <FiX size={18} />
          </button>
          <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 19, fontWeight: 800 }}>Edit Course</h3>
          <p style={{ margin: 0, color: '#64748B', fontSize: 13, lineHeight: 1.4 }}>Update course title, description, pricing and publish status flow.</p>
        </div>

        {/* Form Body (Scrollable) */}
        <div style={{ padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Course Title *</label>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{form.title.length}/100</span>
            </div>
            <input value={form.title} maxLength={100} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Description</label>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{form.description.length}/500</span>
            </div>
            <textarea value={form.description} maxLength={500} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: 600 }}>Course Status Stage</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
                style={{
                  padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer',
                  borderColor: form.status === 'draft' ? '#D97706' : '#E2E8F0',
                  background: form.status === 'draft' ? '#FEF3C7' : '#F8FAFC',
                  color: form.status === 'draft' ? '#92400E' : '#64748B'
                }}
              >
                ○ Draft for Edit
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, status: 'ready_for_publish' }))}
                style={{
                  padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer',
                  borderColor: form.status === 'ready_for_publish' ? '#2563EB' : '#E2E8F0',
                  background: form.status === 'ready_for_publish' ? '#DBEAFE' : '#F8FAFC',
                  color: form.status === 'ready_for_publish' ? '#1E40AF' : '#64748B'
                }}
              >
                ◐ Ready for Publish
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, status: 'published' }))}
                style={{
                  padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer',
                  borderColor: form.status === 'published' ? '#059669' : '#E2E8F0',
                  background: form.status === 'published' ? '#DCFCE7' : '#F8FAFC',
                  color: form.status === 'published' ? '#166534' : '#64748B'
                }}
              >
                ● Active / Published
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Access &amp; Pricing</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, isFree: true, price: 0 }))}
                style={{ padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer', borderColor: form.isFree ? '#10B981' : '#E2E8F0', background: form.isFree ? '#ECFDF5' : '#F8FAFC', color: form.isFree ? '#047857' : '#64748B' }}>
                Free Included
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, isFree: false }))}
                style={{ padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer', borderColor: !form.isFree ? '#D97706' : '#E2E8F0', background: !form.isFree ? '#FFFBEB' : '#F8FAFC', color: !form.isFree ? '#B45309' : '#64748B' }}>
                Paid (₹)
              </button>
            </div>
          </div>

          {!form.isFree && (
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Price (₹)</label>
              <input
                type="number"
                min="0"
                max="999999"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value.slice(0, 8) }))}
                placeholder="e.g. 1499.00"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>New Thumbnail (optional)</label>
            <div onClick={() => thumbRef.current?.click()} style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}>
              {thumbnail ? <div style={{ color: '#10B981', fontWeight: 600 }}>{thumbnail.name} ✓</div> : <div style={{ color: '#94A3B8', fontSize: 13 }}>Click to upload new thumbnail</div>}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setThumbnail(e.target.files[0])} />
          </div>
        </div>

        {/* Pinned Action Footer */}
        <div style={{ padding: '16px 28px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', gap: 12, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 10,
              color: '#64748B',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.15s'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            style={{
              flex: 2,
              padding: '11px 16px',
              background: updating ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              cursor: updating ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: 13.5,
              boxShadow: updating ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.15s'
            }}
          >
            {updating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onUpdate, onEdit }) {
  const { token } = useSelector(s => s.auth)
  const [expanded, setExpanded] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(null)

  // Local videos list for drag-and-drop & rank positioning
  const [videosList, setVideosList] = useState(course.videos || [])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [reordering, setReordering] = useState(false)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemType: 'video', // 'video' | 'course'
    itemId: null,
    itemName: '',
    warningText: '',
    loading: false,
  })

  // Sync videos whenever course prop changes
  useEffect(() => {
    setVideosList(course.videos || [])
  }, [course.videos])

  // Persist new video order to backend
  const persistOrder = async (newVideos) => {
    setVideosList(newVideos)
    setReordering(true)
    try {
      const videoIds = newVideos.map(v => v._id)
      const res = await apiConnector(
        'PUT',
        `/api/v1/courses/${course._id}/videos/reorder`,
        { videoIds },
        { Authorization: `Bearer ${token}` }
      )
      if (res?.data?.success) {
        toast.success('Video order updated successfully')
        if (onUpdate) onUpdate(true)
      } else {
        toast.error(res?.data?.message || 'Failed to update video order')
        setVideosList(course.videos || [])
      }
    } catch (err) {
      toast.error('Failed to save new video order')
      setVideosList(course.videos || [])
    } finally {
      setReordering(false)
    }
  }

  // Shift rank up
  const handleMoveUp = (index) => {
    if (index === 0 || reordering) return
    const updated = [...videosList]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    persistOrder(updated)
  }

  // Shift rank down
  const handleMoveDown = (index) => {
    if (index === videosList.length - 1 || reordering) return
    const updated = [...videosList]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    persistOrder(updated)
  }

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    e.stopPropagation()
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragEnter = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    e.stopPropagation()
    const rawSource = e.dataTransfer.getData('text/plain')
    const sourceIndex = draggedIndex !== null ? draggedIndex : (rawSource !== '' ? parseInt(rawSource, 10) : null)

    setDraggedIndex(null)
    setDragOverIndex(null)

    if (sourceIndex === null || isNaN(sourceIndex) || sourceIndex === targetIndex || sourceIndex < 0 || sourceIndex >= videosList.length) {
      return
    }

    const updated = [...videosList]
    const [movedItem] = updated.splice(sourceIndex, 1)
    updated.splice(targetIndex, 0, movedItem)

    persistOrder(updated)
  }

  const handleDragEnd = (e) => {
    if (e) e.stopPropagation()
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Cycle course status: draft -> ready_for_publish -> published
  const handleNextStatus = async () => {
    setPublishing(true)
    try {
      let nextStatus = 'ready_for_publish'
      if (course.status === 'draft') nextStatus = 'ready_for_publish'
      else if (course.status === 'ready_for_publish') nextStatus = 'published'
      else nextStatus = 'draft'

      const res = await apiConnector('PUT', `/api/v1/courses/${course._id}`, { status: nextStatus }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success(`Course status set to ${nextStatus.replace('_', ' ')}`)
        onUpdate()
      }
    } catch (e) {
      toast.error('Failed to update status')
    }
    setPublishing(false)
  }

  const handleEditDuration = async (vid) => {
    const input = window.prompt(`Enter duration in seconds for "${vid.title}":`, vid.durationSeconds || 0)
    if (input === null) return
    const secs = parseInt(input, 10)
    if (isNaN(secs) || secs < 0) return toast.error('Please enter a valid number of seconds')
    try {
      const res = await apiConnector('PUT', `/api/v1/courses/${course._id}/videos/${vid._id}`, { durationSeconds: secs }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) {
        toast.success('Video duration updated')
        onUpdate()
      }
    } catch (e) {
      toast.error('Failed to update duration')
    }
  }

  // Delete Prompt Triggers
  const promptDeleteVideo = (vid) => {
    setDeleteModal({
      isOpen: true,
      itemType: 'video',
      itemId: vid._id,
      itemName: vid.title,
      warningText: 'This video will be permanently removed from this course. Learners will no longer be able to stream or access it.',
      loading: false,
    })
  }

  const promptDeleteCourse = () => {
    if (course.status === 'published') {
      toast.error('Published courses cannot be deleted directly while live. Please unpublish or set to draft first.')
      return
    }
    setDeleteModal({
      isOpen: true,
      itemType: 'course',
      itemId: course._id,
      itemName: course.title,
      warningText: 'This will permanently delete this entire course and all uploaded videos. This action cannot be undone.',
      loading: false,
    })
  }

  // Confirm delete handler (modal callback)
  const handleConfirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      if (deleteModal.itemType === 'video') {
        const res = await apiConnector(
          'DELETE',
          `/api/v1/courses/${course._id}/videos/${deleteModal.itemId}`,
          null,
          { Authorization: `Bearer ${token}` }
        )
        if (res?.data?.success) {
          toast.success('Video deleted successfully')
          setDeleteModal({ isOpen: false, itemType: 'video', itemId: null, itemName: '', warningText: '', loading: false })
          onUpdate()
        } else {
          toast.error(res?.data?.message || 'Failed to delete video')
          setDeleteModal(prev => ({ ...prev, loading: false }))
        }
      } else if (deleteModal.itemType === 'course') {
        const res = await apiConnector(
          'DELETE',
          `/api/v1/courses/${course._id}`,
          null,
          { Authorization: `Bearer ${token}` }
        )
        if (res?.data?.success) {
          toast.success('Course deleted successfully')
          setDeleteModal({ isOpen: false, itemType: 'course', itemId: null, itemName: '', warningText: '', loading: false })
          onUpdate()
        } else {
          toast.error(res?.data?.message || 'Failed to delete course')
          setDeleteModal(prev => ({ ...prev, loading: false }))
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete')
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, itemType: 'video', itemId: null, itemName: '', warningText: '', loading: false })
  }

  const totalDuration = videosList.reduce((s, v) => s + (v.durationSeconds || 0), 0)

  const getStatusBadge = () => {
    if (course.status === 'published') {
      return { label: '● Active / Published', bg: '#DCFCE7', color: '#166534' }
    } else if (course.status === 'ready_for_publish') {
      return { label: '◐ Ready for Publish', bg: '#DBEAFE', color: '#1E40AF' }
    } else {
      return { label: '○ Draft for Edit', bg: '#FEF3C7', color: '#92400E' }
    }
  }

  const badge = getStatusBadge()

  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.itemType === 'course' ? 'Course' : 'Video'}`}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        warningText={deleteModal.warningText}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteModal.loading}
      />

      {previewVideo && (
        <VideoPreviewModal
          video={previewVideo}
          courseId={course._id}
          onClose={() => setPreviewVideo(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* Course Header */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Thumbnail */}
        <div style={{ width: 80, height: 56, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <FiBookOpen size={24} color="#fff" />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{course.title}</h3>
            <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          </div>
          {course.description && <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: 13, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94A3B8', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiVideo size={12} /> {videosList.length} videos</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {formatDuration(totalDuration)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={12} /> {course.enrolledClients?.length || 0} enrolled</span>
            {course.isFree ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontWeight: 600 }}><FiGlobe size={12} /> Free Included</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontWeight: 600 }}>₹{course.price}</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={() => onEdit(course)}
            style={{ padding: '7px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, color: '#2563EB', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiEdit2 size={13} /> Edit
          </button>
          
          <button onClick={handleNextStatus} disabled={publishing}
            style={{ padding: '7px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, color: '#475569', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            {course.status === 'draft' ? 'Mark Ready' : course.status === 'ready_for_publish' ? 'Publish Live' : 'Set to Draft'}
          </button>

          <button onClick={promptDeleteCourse}
            title="Delete Course"
            style={{ padding: '7px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#EF4444', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Videos Dropdown Accordion */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
            {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            {expanded ? 'Hide Videos' : `View ${videosList.length} Videos`}
          </button>

          <button onClick={() => setShowVideoForm(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            <FiPlus size={16} /> Add Video
          </button>
        </div>

        {expanded && videosList.length > 1 && (
          <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiMove size={12} color="#3B82F6" />
            <span>Drag items or use ▲ ▼ to reorder video rank</span>
          </div>
        )}
      </div>

      {/* Video Upload Form */}
      {showVideoForm && (
        <div style={{ padding: '0 24px 20px' }}>
          <VideoUploadForm
            courseId={course._id}
            onSuccess={() => { setShowVideoForm(false); onUpdate() }}
            onCancel={() => setShowVideoForm(false)}
          />
        </div>
      )}

      {/* Expanded Videos List with Drag-and-Drop Reordering */}
      {expanded && (
        <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: 20 }}>
          {videosList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#94A3B8', fontSize: 13 }}>
              No videos added yet. Click "Add Video" above to upload your first lecture.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {videosList.map((vid, i) => {
                const isDragging = draggedIndex === i
                const isOver = dragOverIndex === i

                return (
                  <div
                    key={vid._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragEnter={(e) => handleDragEnter(e, i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      background: isDragging ? '#F1F5F9' : '#FFFFFF',
                      border: isOver ? '2px dashed #3B82F6' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      opacity: isDragging ? 0.5 : 1,
                      transform: isOver ? 'scale(1.01)' : 'scale(1)',
                      transition: 'border 0.15s, transform 0.15s, box-shadow 0.15s',
                      boxShadow: isOver ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                      cursor: 'grab'
                    }}
                  >
                    {/* Drag Handle Icon */}
                    <div
                      title="Drag to reorder position"
                      style={{
                        color: '#94A3B8',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: 4
                      }}
                    >
                      <FiMove size={16} />
                    </div>

                    {/* Step Shift Buttons (Up / Down arrows for quick rank shift) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveUp(i) }}
                        disabled={i === 0 || reordering}
                        title="Move Up"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '1px 3px',
                          cursor: i === 0 || reordering ? 'not-allowed' : 'pointer',
                          color: i === 0 ? '#CBD5E1' : '#64748B',
                          lineHeight: 1,
                          borderRadius: 3
                        }}
                      >
                        <FiArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveDown(i) }}
                        disabled={i === videosList.length - 1 || reordering}
                        title="Move Down"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '1px 3px',
                          cursor: i === videosList.length - 1 || reordering ? 'not-allowed' : 'pointer',
                          color: i === videosList.length - 1 ? '#CBD5E1' : '#64748B',
                          lineHeight: 1,
                          borderRadius: 3
                        }}
                      >
                        <FiArrowDown size={12} />
                      </button>
                    </div>

                    {/* Rank Badge */}
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: '#EFF6FF',
                      color: '#2563EB',
                      fontWeight: 800,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      #{i + 1}
                    </div>

                    {/* Title & Description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vid.title}
                      </div>
                      {vid.description && (
                        <div style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {vid.description}
                        </div>
                      )}
                    </div>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(vid)}
                      style={{
                        padding: '6px 12px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 8,
                        color: '#2563EB',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0
                      }}
                    >
                      <FiPlay size={12} /> Preview
                    </button>

                    {/* Duration Badge & Edit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 12,
                        color: vid.durationSeconds > 0 ? '#64748B' : '#EF4444',
                        fontWeight: vid.durationSeconds > 0 ? 500 : 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#F1F5F9',
                        padding: '4px 8px',
                        borderRadius: 6
                      }}>
                        <FiClock size={12} /> {formatDuration(vid.durationSeconds)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditDuration(vid)}
                        title="Edit duration in seconds"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }}
                      >
                        <FiEdit3 size={13} />
                      </button>
                    </div>

                    {/* Delete Video Button with Professional Confirmation */}
                    <button
                      type="button"
                      onClick={() => promptDeleteVideo(vid)}
                      title="Delete Video"
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: '#EF4444',
                        padding: '5px 7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Create Course Modal ──────────────────────────────────────────────────────
function CreateCourseModal({ onClose, onSuccess }) {
  const { token } = useSelector(s => s.auth)
  const [form, setForm] = useState({ title: '', description: '', price: 0, isFree: true, tags: '' })
  const [thumbnail, setThumbnail] = useState(null)
  const [creating, setCreating] = useState(false)
  const thumbRef = useRef()

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error('Course title is required')
    setCreating(true)

    try {
      const fd = new FormData()
      fd.append('title', form.title.slice(0, 100))
      fd.append('description', form.description.slice(0, 500))
      fd.append('isFree', form.isFree)
      fd.append('price', form.isFree ? 0 : form.price)
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      if (thumbnail) fd.append('thumbnail', thumbnail)

      const res = await apiConnector('POST', '/api/v1/courses', fd, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      })

      if (res?.data?.success) {
        toast.success('Course created in Draft mode! You can now edit and add videos.')
        onSuccess()
      } else {
        toast.error(res?.data?.message || 'Create failed')
      }
    } catch (e) {
      toast.error('Could not create course: ' + (e.message || 'Unknown error'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          width: '100%',
          maxWidth: 560,
          maxHeight: 'min(90vh, 780px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #F1F5F9', position: 'relative', flexShrink: 0 }}>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#1E293B' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B' }}
          >
            <FiX size={18} />
          </button>
          <h3 style={{ margin: '0 0 4px', color: '#0F172A', fontSize: 19, fontWeight: 800 }}>Create New Course</h3>
          <p style={{ margin: 0, color: '#64748B', fontSize: 13, lineHeight: 1.4 }}>Create a new course container (saved as Draft for Edit). Add videos next.</p>
        </div>

        {/* Form Body (Scrollable) */}
        <div style={{ padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Course Title *</label>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{form.title.length}/100</span>
            </div>
            <input value={form.title} maxLength={100} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. 6-Week Stress Management Masterclass"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Description</label>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{form.description.length}/500</span>
            </div>
            <textarea value={form.description} maxLength={500} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Describe the outcome learners will gain from this course series..."
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Access &amp; Pricing Model</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, isFree: true, price: 0 }))}
                style={{ padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer', borderColor: form.isFree ? '#10B981' : '#E2E8F0', background: form.isFree ? '#ECFDF5' : '#F8FAFC', color: form.isFree ? '#047857' : '#64748B' }}>
                Included in Plans
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, isFree: false }))}
                style={{ padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer', borderColor: !form.isFree ? '#D97706' : '#E2E8F0', background: !form.isFree ? '#FFFBEB' : '#F8FAFC', color: !form.isFree ? '#B45309' : '#64748B' }}>
                Paid Course (₹)
              </button>
            </div>
          </div>

          {!form.isFree && (
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Course Price (₹) *</label>
              <input type="number" min="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 499"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #D97706', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. mindfulness, anxiety, meditation"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Thumbnail Image (optional)</label>
            <div onClick={() => thumbRef.current?.click()} style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}>
              {thumbnail ? <div style={{ color: '#10B981', fontWeight: 600 }}>{thumbnail.name} ✓</div> : <div style={{ color: '#94A3B8', fontSize: 13 }}><FiUpload style={{ marginBottom: 4 }} /><br />Click to upload thumbnail</div>}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setThumbnail(e.target.files[0])} />
          </div>
        </div>

        {/* Pinned Action Footer */}
        <div style={{ padding: '16px 28px 20px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', gap: 12, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 10,
              color: '#64748B',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.15s'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            style={{
              flex: 2,
              padding: '11px 16px',
              background: creating ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: 13.5,
              boxShadow: creating ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.15s'
            }}
          >
            {creating ? 'Creating...' : '✓ Create Course (Draft Mode)'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main MyCourses Component ─────────────────────────────────────────────────
export default function MyCourses() {
  const { token } = useSelector(s => s.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const loadCourses = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/courses/practitioner/my-courses', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setCourses(res.data.courses || [])
    } catch (e) { toast.error('Failed to load courses') }
    if (!silent) setLoading(false)
  }, [token])

  useEffect(() => { loadCourses() }, [loadCourses])

  const totalVideos = courses.reduce((s, c) => s + (c.videos?.length || 0), 0)
  const publishedCount = courses.filter(c => c.status === 'published').length
  const readyCount = courses.filter(c => c.status === 'ready_for_publish').length
  const draftCount = courses.filter(c => c.status === 'draft').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadCourses() }} />}
      {editingCourse && <EditCourseModal course={editingCourse} onClose={() => setEditingCourse(null)} onSuccess={() => { setEditingCourse(null); loadCourses() }} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', color: '#1E293B', fontSize: 22, fontWeight: 800 }}>My Courses</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Create video courses for your learners to access with their subscription</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <FiPlus /> New Course
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Courses', value: courses.length, color: '#3B82F6' },
          { label: 'Total Videos', value: totalVideos, color: '#8B5CF6' },
          { label: 'Published Active', value: publishedCount, color: '#10B981' },
          { label: 'Ready for Publish', value: readyCount, color: '#2563EB' },
          { label: 'Drafts for Edit', value: draftCount, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Courses List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48, color: '#94A3B8' }}>
          <FiRefreshCw style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
          Loading your courses...
        </div>
      ) : courses.length === 0 ? (
        <div style={{ background: '#fff', border: '2px dashed #E2E8F0', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <FiBookOpen size={40} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>No courses yet</h3>
          <p style={{ margin: '0 0 20px', color: '#64748B' }}>Create your first course and start uploading videos for your learners</p>
          <button onClick={() => setShowCreate(true)}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
            Create First Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          {courses.map(course => (
            <CourseCard key={course._id} course={course} onUpdate={loadCourses} onEdit={setEditingCourse} />
          ))}
        </div>
      )}
    </div>
  )
}
