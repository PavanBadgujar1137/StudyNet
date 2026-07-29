import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  FiBookOpen, FiPlus, FiVideo, FiUpload, FiTrash2,
  FiUsers, FiClock, FiX, FiPlay,
  FiChevronDown, FiChevronUp, FiGlobe, FiLock, FiRefreshCw
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { apiConnector } from '../../../../services/apiConnector'

const PLAN_OPTIONS = [
  { value: '', label: 'Free (no subscription needed)' },
  { value: 'starter', label: 'Starter Plan & above' },
  { value: 'growth', label: 'Growth Plan & above' },
  { value: 'practice', label: 'Practice Plan only' },
]

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
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('video', videoFile)

      // Simulate progress
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
          <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Video Title *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to Mindfulness"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Description (optional)</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} placeholder="What will clients learn in this video?"
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#1E293B', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
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

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onUpdate }) {
  const { token } = useSelector(s => s.auth)
  const [expanded, setExpanded] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const togglePublish = async () => {
    setPublishing(true)
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published'
      const res = await apiConnector('PUT', `/api/v1/courses/${course._id}`, { status: newStatus }, { Authorization: `Bearer ${token}` })
      if (res?.data?.success) { toast.success(`Course ${newStatus}`); onUpdate() }
    } catch (e) { toast.error('Failed to update status') }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{course.title}</h3>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: course.status === 'published' ? '#DCFCE7' : '#FEF3C7',
              color: course.status === 'published' ? '#166534' : '#92400E' }}>
              {course.status === 'published' ? '● Published' : '○ Draft'}
            </span>
          </div>
          {course.description && <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: 13, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94A3B8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiVideo size={12} /> {course.videos?.length || 0} videos</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {formatDuration(totalDuration)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={12} /> {course.enrolledClients?.length || 0} enrolled</span>
            {course.requiredPlan
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8B5CF6' }}><FiLock size={12} /> {course.requiredPlan} plan</span>
              : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981' }}><FiGlobe size={12} /> Free access</span>
            }
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={togglePublish} disabled={publishing}
            style={{ padding: '7px 14px', background: course.status === 'published' ? '#FEF3C7' : '#DCFCE7', border: 'none', borderRadius: 8, color: course.status === 'published' ? '#92400E' : '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            {course.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={deleteCourse} disabled={deleting}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiTrash2 size={14} />
          </button>
          <button onClick={() => setExpanded(e => !e)}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Videos */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 24px' }}>
          {course.videos?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {course.videos.map((video, idx) => (
                <div key={video._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F620, #8B5CF620)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                    <FiPlay size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#1E293B', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {idx + 1}. {video.title}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: 11 }}>{formatDuration(video.durationSeconds)} • {video.views || 0} views</div>
                  </div>
                  <button onClick={() => deleteVideo(video._id)}
                    style={{ width: 28, height: 28, borderRadius: 6, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
              No videos yet. Add your first video below!
            </div>
          )}

          {!showVideoForm ? (
            <button onClick={() => setShowVideoForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg, #3B82F610, #8B5CF610)', border: '1px dashed #3B82F640', borderRadius: 8, color: '#3B82F6', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <FiPlus size={14} /> Add Video
            </button>
          ) : (
            <VideoUploadForm
              courseId={course._id}
              onSuccess={() => { setShowVideoForm(false); onUpdate() }}
              onCancel={() => setShowVideoForm(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Create Course Modal ──────────────────────────────────────────────────────
function CreateCourseModal({ onClose, onSuccess }) {
  const { token } = useSelector(s => s.auth)
  const [form, setForm] = useState({ title: '', description: '', requiredPlan: '', tags: '' })
  const [thumbnail, setThumbnail] = useState(null)
  const [creating, setCreating] = useState(false)
  const thumbRef = useRef()

  const handleCreate = async () => {
    if (!form.title) return toast.error('Course title is required')
    setCreating(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('requiredPlan', form.requiredPlan)
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)))
      if (thumbnail) fd.append('thumbnail', thumbnail)

      const res = await apiConnector('POST', '/api/v1/courses', fd, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      })
      if (res?.data?.success) {
        toast.success('Course created! Now add videos.')
        onSuccess()
      } else {
        toast.error(res?.data?.message || 'Failed to create course')
      }
    } catch (e) { toast.error(e.message || 'Failed to create course') }
    setCreating(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 520, maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, color: '#1E293B', fontSize: 18, fontWeight: 800 }}>Create New Course</h3>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><FiX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Course Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Anxiety Relief Masterclass"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="What will clients learn?"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Access Requirement</label>
            <select value={form.requiredPlan} onChange={e => setForm(f => ({ ...f, requiredPlan: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', background: '#fff', cursor: 'pointer' }}>
              {PLAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: 11 }}>
              Choose which subscription plan clients need to access this course
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. mindfulness, anxiety, meditation"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>Thumbnail Image (optional)</label>
            <div onClick={() => thumbRef.current?.click()}
              style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}
            >
              {thumbnail
                ? <div style={{ color: '#10B981', fontWeight: 600 }}>{thumbnail.name} ✓</div>
                : <div style={{ color: '#94A3B8' }}><FiUpload style={{ marginBottom: 4 }} /><br />Click to upload thumbnail</div>
              }
            </div>
            <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setThumbnail(e.target.files[0])} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 10, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleCreate} disabled={creating}
            style={{ flex: 2, padding: '12px', background: creating ? '#CBD5E1' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14 }}>
            {creating ? 'Creating...' : '✓ Create Course'}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadCourses() }} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', color: '#1E293B', fontSize: 22, fontWeight: 800 }}>My Courses</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: 14 }}>Create video courses for your clients to access with their subscription</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <FiPlus /> New Course
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Courses', value: courses.length, color: '#3B82F6' },
          { label: 'Published', value: publishedCount, color: '#10B981' },
          { label: 'Total Videos', value: totalVideos, color: '#8B5CF6' },
          { label: 'Drafts', value: courses.length - publishedCount, color: '#F59E0B' },
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
          <p style={{ margin: '0 0 20px', color: '#64748B' }}>Create your first course and start uploading videos for your clients</p>
          <button onClick={() => setShowCreate(true)}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
            Create First Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          {courses.map(course => (
            <CourseCard key={course._id} course={course} onUpdate={loadCourses} />
          ))}
        </div>
      )}
    </div>
  )
}
