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
      const validation = validateImageFile(file, 10)
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
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
      <div className="flex items-center gap-5">
        <div className="relative">
          <img
            src={previewSource || user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md bg-slate-800"
          />
          <label 
            htmlFor="profile-picture-upload-input"
            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
            title="Choose new image"
          >
            <FiCamera className="text-xs" />
          </label>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Profile Picture</h3>
          <p className="text-xs text-slate-500 max-w-sm">PNG, JPG, WebP, GIF or HEIC (max 10MB). macOS & iOS compatible.</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '480px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
            border: '1px solid #CBD5E1',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-block'
          }}
        >
          Select Image
        </label>

        <button
          type="button"
          onClick={handleFileUpload}
          disabled={loading || deleting || !imageFile}
          style={{
            background: 'linear-gradient(135deg, #1F5FE0 0%, #8A2BE0 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: (loading || deleting || !imageFile) ? 0.5 : 1,
            boxShadow: '0 4px 12px rgba(31, 95, 224, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          {loading ? "Uploading..." : "Upload New Photo"}
          {!loading && <FiUpload style={{ fontSize: '13px' }} />}
        </button>

        <button
          type="button"
          onClick={handleDeletePicture}
          disabled={loading || deleting}
          style={{
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          title="Remove profile picture"
        >
          <FiTrash2 style={{ fontSize: '13px', color: '#DC2626' }} />
          <span>{deleting ? "Removing..." : "Remove Photo"}</span>
        </button>
      </div>
    </div>
  )
}
