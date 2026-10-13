import { useEffect, useRef, useState } from "react"
import { FiUpload, FiCamera, FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"

import { updateDisplayPicture, deleteDisplayPicture } from "../../../../services/operations/SettingsAPI"
import { processImageForUpload, validateImageFile } from "../../../../utils/imageProcessing"
import toast from "react-hot-toast"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateImageFile(file, 1024)
      if (!validation.valid) {
        return toast.error(validation.error)
      }
      try {
        const processed = await processImageForUpload(file)
        setImageFile(processed)
        previewFile(processed)
      } catch (err) {
        console.error("Profile picture processing error:", err)
        setImageFile(file)
        previewFile(file)
      }
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = () => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)
      dispatch(updateDisplayPicture(token, formData)).then(() => {
        setLoading(false)
        setImageFile(null)
        setPreviewSource(null)
      })
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
      setLoading(false)
    }
  }

  const handleDeletePicture = () => {
    if (imageFile || previewSource) {
      setImageFile(null)
      setPreviewSource(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    setDeleting(true)
    dispatch(deleteDisplayPicture(token)).then(() => {
      setDeleting(false)
      setImageFile(null)
      setPreviewSource(null)
    }).catch(() => {
      setDeleting(false)
    })
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])

  return (
    <div className="oh-profile-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCamera size={18} />
            </span>
            Profile Photo
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            Upload a clear, professional portrait to inspire trust with your learners and clients
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar Preview */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '24px',
                padding: '3px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.25)',
              }}
            >
              {previewSource || (user?.image && !user?.image?.includes('dicebear')) ? (
                <img
                  src={previewSource || user?.image}
                  alt={`profile-${user?.firstName}`}
                  style={{ width: '100%', height: '100%', borderRadius: '21px', objectFit: 'cover', background: '#0F172A' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=4F46E5&color=fff&size=200&bold=true`
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '21px',
                    background: 'linear-gradient(135deg, #4338CA, #7C3AED)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '32px',
                    fontWeight: 900,
                  }}
                >
                  {`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'P'}
                </div>
              )}
            </div>

            <label 
              htmlFor="profile-picture-upload-input"
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                padding: '8px',
                borderRadius: '12px',
                background: '#4F46E5',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Choose new image"
            >
              <FiCamera size={14} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {previewSource ? "New Image Preview Selected" : "Current Display Picture"}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              PNG, JPG, WebP, GIF, or HEIC (max 10MB). Automatically centered and compressed for lightning-fast loads across mobile and desktop.
            </p>
            {previewSource && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Image selected — click "Upload New Photo" to apply changes
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <input
            id="profile-picture-upload-input"
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              handleFileChange(e)
              e.target.value = ''
            }}
            style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/heic,image/heif,.png,.jpg,.jpeg,.webp,.gif,.heic,.heif,image/*"
          />

          <label
            htmlFor="profile-picture-upload-input"
            style={{
              background: '#F1F5F9',
              color: '#334155',
              border: '1.5px solid #CBD5E1',
              padding: '12px 22px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FiCamera size={14} />
            <span>Select Image</span>
          </label>

          <button
            type="button"
            onClick={handleFileUpload}
            disabled={loading || deleting || !imageFile}
            className="oh-profile-btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <FiUpload size={14} />
            <span>{loading ? "Uploading Photo..." : "Upload New Photo"}</span>
          </button>

          <button
            type="button"
            onClick={handleDeletePicture}
            disabled={loading || deleting}
            style={{
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1.5px solid #FECDD3',
              padding: '12px 20px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading || deleting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              marginLeft: 'auto'
            }}
            title="Remove profile picture"
          >
            <FiTrash2 size={14} style={{ color: '#DC2626' }} />
            <span>{deleting ? "Removing..." : "Remove Photo"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

