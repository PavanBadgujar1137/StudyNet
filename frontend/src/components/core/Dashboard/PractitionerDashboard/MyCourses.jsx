import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  FiBookOpen, FiPlus, FiVideo, FiUpload, FiTrash2,
  FiUsers, FiClock, FiX, FiEdit2,
  FiChevronDown, FiChevronUp, FiGlobe, FiRefreshCw

} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

function formatDuration(secs) {
  if (!secs) return '0:00'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── Video Upload Card ────────────────────────────────────────────────────────
function VideoUploadForm({ courseId, onSuccess, onCancel }) {
  const { token } = useSelector(s => s.auth)
  const [form, setForm] = useState({ title: '', description: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoInputRef = useRef()

  const handleUpload = async () => {
    if (!form.title || !videoFile) return toast.error('Title and video file are required')
    setUploading(true)
    setProgress(10)
    try {
      const fd = new FormData()
      fd.append('title', form.title.slice(0, 100))
      fd.append('description', form.description.slice(0, 500))
      fd.append('video', videoFile)

      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 8, 85))
      }, 500)

      const res = await apiConnector('POST', `/api/v1/courses/${courseId}/videos`, fd, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (res?.data?.success) {
        toast.success('Video uploaded successfully!')
        onSuccess()
      } else {
        toast.error(res?.data?.message || 'Upload failed')
      }
    } catch (e) {
      toast.error('Upload failed: ' + (e.message || 'Unknown error'))
    }
    setUploading(false)
    setProgress(0)
  }

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
          <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Video File *</label>
          <div onClick={() => videoInputRef.current?.click()}
            style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: videoFile ? '#F0FDF4' : '#F8FAFC', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}
          >
            <FiVideo size={24} color={videoFile ? '#10B981' : '#94A3B8'} style={{ marginBottom: 8 }} />
            {videoFile ? (
              <div>
                <div style={{ color: '#10B981', fontWeight: 600, fontSize: 14 }}>{videoFile.name}</div>
                <div style={{ color: '#64748B', fontSize: 12 }}>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            ) : (
              <div>
                <div style={{ color: '#64748B', fontSize: 14 }}>Click to select video file</div>
                <div style={{ color: '#94A3B8', fontSize: 12 }}>MP4, MOV, AVI (max 500MB)</div>
              </div>
            )}
          </div>
          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }}
            onChange={e => setVideoFile(e.target.files[0])} />
        </div>

        {uploading && (
          <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>
              <span>Uploading to Cloudinary...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ background: '#BFDBFE', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ background: '#3B82F6', height: '100%', width: `${progress}%`, transition: 'width 0.5s ease', borderRadius: 4 }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: 8, color: '#64748B', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={handleUpload} disabled={uploading}
            style={{ flex: 2, padding: '10px', background: uploading ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 8, color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiUpload /> {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Course Modal (ITEM 20 FIX) ──────────────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, margin: 'auto', padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
          <FiX size={20} />
        </button>

        <h3 style={{ margin: '0 0 6px', color: '#1E293B', fontSize: 18, fontWeight: 800 }}>Edit Course (Draft/Published)</h3>
        <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: 13 }}>Update course title, description, pricing and publish status flow.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

          {/* ITEM 19 FIX: 3-Stage Course Status Flow Selector */}
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

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleUpdate} disabled={updating} style={{ flex: 2, padding: '12px', background: updating ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14 }}>
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
  const [deleting, setDeleting] = useState(false)

  // ITEM 19 FIX: Cycle course status: draft -> ready_for_publish -> published
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

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return
    try {
      const res = await apiConnector('DELETE', `/api/v1/courses/${course._id}/videos/${videoId}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { toast.success('Video deleted'); onUpdate() }
    } catch (e) { toast.error('Failed to delete') }
  }

  const deleteCourse = async () => {
    if (!window.confirm('Delete this entire course and all its videos?')) return
    setDeleting(true)
    try {
      const res = await apiConnector('DELETE', `/api/v1/courses/${course._id}`, null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { toast.success('Course deleted'); onUpdate() }
    } catch (e) { toast.error('Failed to delete course') }
    setDeleting(false)
  }

  const totalDuration = course.videos?.reduce((s, v) => s + (v.durationSeconds || 0), 0) || 0

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
            {/* ITEM 19 FIX: 3-Stage Course Status Badge */}
            <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          </div>
          {course.description && <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: 13, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94A3B8', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiVideo size={12} /> {course.videos?.length || 0} videos</span>
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
          {/* ITEM 20 FIX: Edit Draft Course Button */}
          <button onClick={() => onEdit(course)}
            style={{ padding: '7px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, color: '#2563EB', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiEdit2 size={13} /> Edit
          </button>
          
          {/* ITEM 19 FIX: Cycle Status Button */}
          <button onClick={handleNextStatus} disabled={publishing}
            style={{ padding: '7px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, color: '#475569', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            {course.status === 'draft' ? 'Mark Ready' : course.status === 'ready_for_publish' ? 'Publish Live' : 'Set to Draft'}
          </button>

          <button onClick={deleteCourse} disabled={deleting}
            style={{ padding: '7px 10px', background: '#FEF2F2', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Videos Dropdown Accordion */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
          {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          {expanded ? 'Hide Videos' : `View ${course.videos?.length || 0} Videos`}
        </button>

        <button onClick={() => setShowVideoForm(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <FiPlus size={16} /> Add Video
        </button>
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

      {/* Expanded Videos List */}
      {expanded && (
        <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: 20 }}>
          {!course.videos || course.videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#94A3B8', fontSize: 13 }}>
              No videos added yet. Click "Add Video" above to upload your first lecture.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {course.videos.map((vid, i) => (
                <div key={vid._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', color: '#3B82F6', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{vid.title}</div>
                    {vid.description && <div style={{ fontSize: 12, color: '#64748B' }}>{vid.description}</div>}
                  </div>
                  <span style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiClock size={12} /> {formatDuration(vid.durationSeconds)}
                  </span>
                  <button onClick={() => deleteVideo(vid._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, margin: 'auto', padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
          <FiX size={20} />
        </button>

        <h3 style={{ margin: '0 0 6px', color: '#1E293B', fontSize: 18, fontWeight: 800 }}>Create New Course</h3>
        <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: 13 }}>Create a new course container (saved as Draft for Edit). Add videos next.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            <div onClick={() => thumbRef.current?.click()} style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}>
              {thumbnail ? <div style={{ color: '#10B981', fontWeight: 600 }}>{thumbnail.name} ✓</div> : <div style={{ color: '#94A3B8' }}><FiUpload style={{ marginBottom: 4 }} /><br />Click to upload thumbnail</div>}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setThumbnail(e.target.files[0])} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleCreate} disabled={creating} style={{ flex: 2, padding: '12px', background: creating ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14 }}>
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

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector('GET', '/api/v1/courses/practitioner/my-courses', null, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) setCourses(res.data.courses || [])
    } catch (e) { toast.error('Failed to load courses') }
    setLoading(false)
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
