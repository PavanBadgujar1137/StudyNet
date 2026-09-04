import { useEffect, useRef, useState } from "react"
import { FiUpload, FiCamera, FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"

import { updateDisplayPicture, deleteDisplayPicture } from "../../../../services/operations/SettingsAPI"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      previewFile(file)
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
          <button 
            type="button" 
            onClick={handleClick}
            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all"
            title="Choose new image"
          >
            <FiCamera className="text-xs" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Profile Picture</h3>
          <p className="text-xs text-slate-500 max-w-sm">PNG, JPG or GIF (max 5MB). Recommended square aspect ratio.</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '480px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/gif, image/jpeg"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={loading || deleting}
          style={{
            background: '#F1F5F9',
            color: '#334155',
            border: '1px solid #CBD5E1',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Select Image
        </button>

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
