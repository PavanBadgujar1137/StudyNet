import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"

import { updateDisplayPicture } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/IconBtn"

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
    // console.log(file)
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
      console.log("uploading...")
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)
      // console.log("formdata", formData)
      dispatch(updateDisplayPicture(token, formData)).then(() => {
        setLoading(false)
      })
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])
  return (
    <>
      <div
        className="
      flex
      items-center
      justify-between
      rounded-2xl
      border
      border-ink-600
      bg-ink-800
      p-8
      shadow-lg
    "
      >

        <div className="flex items-center gap-x-5">

          <div className="relative">
            <img
              src={previewSource || user?.image}
              alt={`profile-${user?.firstName}`}
              className="
            aspect-square
            w-[90px]
            rounded-full
            border-2
            border-gold-500
            object-cover
          "
            />

            <div
              className="
            absolute
            bottom-1
            right-1
            h-4
            w-4
            rounded-full
            border-2
            border-ink-800
            bg-sage-400
          "
            />
          </div>


          <div className="space-y-4">

            <div>
              <p className="text-lg font-semibold text-ink-50">
                Change Profile Picture
              </p>

              <p className="mt-1 text-sm text-ink-300">
                Upload a new profile image
              </p>
            </div>


            <div className="flex items-center gap-3">

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
                className="
              cursor-pointer
              rounded-xl
              border
              border-ink-600
              bg-ink-700
              px-6
              py-2.5
              text-sm
              font-medium
              text-ink-100
              transition-all
              hover:bg-ink-600
              hover:text-gold-400
            "
              >
                Select
              </button>


              <IconBtn
                text={loading ? "Uploading..." : "Upload"}
                onclick={handleFileUpload}
              >
                {!loading && (
                  <FiUpload className="text-lg text-ink-900" />
                )}
              </IconBtn>


            </div>


          </div>

        </div>


      </div>
    </>
  )
}
