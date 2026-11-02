import { useEffect, useRef, useState } from "react"
import { FiCamera, FiTrash2, FiRotateCw } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"

import { updateDisplayPicture, deleteDisplayPicture } from "../../../../services/operations/SettingsAPI"
import { validateImageFile, processImageForUpload } from "../../../../utils/imageProcessing"
import toast from "react-hot-toast"
import ProfilePictureCropModal from "./ProfilePictureCropModal"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  // Cropping modal states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState(null)

  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 10MB limit matching backend Sharp processing capacity
    const validation = validateImageFile(file, 10)
    if (!validation.valid) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      return toast.error(validation.error)
    }

    if (cropImageSrc) {
      try {
        ; (window.URL || URL).revokeObjectURL(cropImageSrc)
      } catch (_) { }
    }

    try {
      // Decode HEIC or specialized Apple photo formats when supported by the client browser
      let fileToCrop = file
      try {
        fileToCrop = await processImageForUpload(file)
      } catch (procErr) {
        console.warn("[ChangeProfilePicture] Pre-processing fallback to original:", procErr)
        fileToCrop = file
      }

      const urlFn = (typeof window !== "undefined" && window.URL && window.URL.createObjectURL) || URL.createObjectURL
      const objectUrl = urlFn(fileToCrop)
      setCropImageSrc(objectUrl)
      setIsCropModalOpen(true)
    } catch (err) {
      console.error("Error creating object URL for cropping:", err)
      toast.error("Could not preview selected image")
    }
  }

  const handleCropCancel = () => {
    setIsCropModalOpen(false)
    if (cropImageSrc) {
      try {
        ; (window.URL || URL).revokeObjectURL(cropImageSrc)
      } catch (_) { }
      setCropImageSrc(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCropConfirm = async (croppedFile) => {
    let success = false
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", croppedFile)

      const result = await dispatch(updateDisplayPicture(token, formData))
      success = result !== false
    } catch (error) {
      console.error("Profile picture upload error:", error)
      success = false
    } finally {
      setLoading(false)
    }

    if (success) {
      // Exactly ONE upload sent. Clear imageFile so NO duplicate upload button appears.
      setImageFile(null)
      setIsCropModalOpen(false)

      // Update local preview with the newly uploaded image
      const reader = new FileReader()
      reader.readAsDataURL(croppedFile)
      reader.onloadend = () => {
        setPreviewSource(reader.result)
      }

      if (cropImageSrc) {
        try {
          ; (window.URL || URL).revokeObjectURL(cropImageSrc)
        } catch (_) { }
        setCropImageSrc(null)
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
    } else {
      // Upload failed: retain croppedFile in state so user can retry without re-cropping
      setImageFile(croppedFile)
      const reader = new FileReader()
      reader.readAsDataURL(croppedFile)
      reader.onloadend = () => {
        setPreviewSource(reader.result)
      }
      setIsCropModalOpen(false)
      if (cropImageSrc) {
        try {
          ; (window.URL || URL).revokeObjectURL(cropImageSrc)
        } catch (_) { }
        setCropImageSrc(null)
      }
      toast.error("Upload failed. You can click 'Retry Upload' to try again.")
    }
  }

  const handleFileUpload = async () => {
    if (!imageFile) return
    let success = false
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)

      const result = await dispatch(updateDisplayPicture(token, formData))
      success = result !== false
    } catch (error) {
      console.error("Profile picture retry upload error:", error)
      success = false
    } finally {
      setLoading(false)
    }

    if (success) {
      // Retry succeeded: clear imageFile so button disappears
      setImageFile(null)
      setPreviewSource(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } else {
      toast.error("Retry failed. Please check your connection and try again.")
    }
  }

  const handleDeletePicture = () => {
    if (imageFile || previewSource) {
      setImageFile(null)
      setPreviewSource(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    setDeleting(true)
    dispatch(deleteDisplayPicture(token))
      .then(() => {
        setDeleting(false)
        setImageFile(null)
        setPreviewSource(null)
      })
      .catch(() => {
        setDeleting(false)
      })
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (cropImageSrc) {
        try {
          ; (window.URL || URL).revokeObjectURL(cropImageSrc)
        } catch (_) { }
      }
    }
  }, [cropImageSrc])

  return (
    <>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
        <div className="flex items-center gap-5">
          <div className="relative">
            {previewSource || (user?.image && !user?.image?.includes('dicebear')) ? (
              <img
                src={previewSource || user?.image}
                alt={`profile-${user?.firstName}`}
                className="aspect-square w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md bg-slate-800"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=4F46E5&color=fff&size=200&bold=true`
                }}
              />
            ) : (
              <div className="aspect-square w-20 h-20 rounded-2xl ring-4 ring-slate-100 shadow-md bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold tracking-tight">
                {`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || '?'}
              </div>
            )}
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
            <p className="text-xs text-slate-500 max-w-sm">
              PNG, JPG, WebP, GIF or HEIC (max 10MB). Crop &amp; reposition available.
            </p>
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

          {/* Retry Upload button ONLY appears if a previous crop upload failed */}
          {imageFile && (
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={loading || deleting}
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
                opacity: (loading || deleting) ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(31, 95, 224, 0.35)',
                transition: 'all 0.15s ease'
              }}
              title="Retry uploading the cropped image"
            >
              {loading ? "Uploading..." : "Retry Upload"}
              {!loading && <FiRotateCw style={{ fontSize: '13px' }} />}
            </button>
          )}

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

      {/* Profile Picture Cropping Modal */}
      <ProfilePictureCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={handleCropCancel}
        onConfirm={handleCropConfirm}
        isUploading={loading}
      />
    </>
  )
}
