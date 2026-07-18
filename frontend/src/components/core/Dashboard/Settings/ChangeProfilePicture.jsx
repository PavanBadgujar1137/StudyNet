import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"

import { updateDisplayPicture } from "../../../../services/operations/SettingsAPI"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
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
      })
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm text-navy text-left">
      <div className="flex items-center gap-4">
        <img
          src={previewSource || user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-16 h-16 rounded-full object-cover border border-slate-200 p-0.5 shadow-sm shrink-0 animate-fadeIn"
        />
        <div className="space-y-2">
          <h3 className="font-fraunces text-navy text-lg font-bold">Change Profile Picture</h3>
          <div className="flex flex-row gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/gif, image/jpeg"
            />
            <button
              onClick={handleClick}
              disabled={loading}
              className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-5 text-xs transition-all hover:scale-95"
            >
              Select Image
            </button>
            <button
              onClick={handleFileUpload}
              disabled={loading || !imageFile}
              className="rounded-full bg-royal-blue hover:bg-royal-blue/90 disabled:bg-royal-blue/40 text-white font-semibold py-2 px-5 text-xs transition-all hover:scale-95 shadow-sm flex items-center gap-1.5"
            >
              {loading ? "Uploading..." : "Upload"}
              {!loading && <FiUpload className="text-xs" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
