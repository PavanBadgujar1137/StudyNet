import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  FiDownload, FiFileText, FiUploadCloud, FiSearch, FiX,
} from "react-icons/fi"
import toast from "react-hot-toast"

import { uploadNote, getNotesByCourse, trackDownload } from "../../../services/operations/notesAPI"

const NOTE_TYPES = [
  { value: "notes", label: "Study Notes", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "dpp", label: "Daily Practice Papers (DPP)", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { value: "formula_sheet", label: "Formula Sheets", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "assignment", label: "Assignments", color: "bg-green-500/10 text-green-400 border-green-500/20" },
]

export default function StudyMaterialHub({ courseId }) {
  const { token } = useSelector((s) => s.auth)
  const { user } = useSelector((s) => s.profile)

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState("")

  // Instructor Upload Form State
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState("notes")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const isInstructor = user?.accountType === "Instructor"

  const fetchNotes = async () => {
    setLoading(true)
    const data = await getNotesByCourse(token, courseId)
    setNotes(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!title || !file) {
      toast.error("Please fill in all required fields")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("type", type)
    formData.append("courseId", courseId)
    formData.append("file", file)

    const res = await uploadNote(token, formData)
    setUploading(false)
    if (res) {
      setUploadModalOpen(false)
      setTitle("")
      setFile(null)
      fetchNotes()
    }
  }

  const handleDownload = async (note) => {
    if (!note.downloadable) {
      toast.error("Downloads are disabled for this item")
      return
    }
    // Track download in analytics
    await trackDownload(token, note._id)
    
    // Open in a new tab
    window.open(note.fileUrl, "_blank")
  }

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = !selectedType || n.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-richblack-700 pb-4">
        <div>
          <h3 className="text-lg font-bold text-richblack-5">Notes & DPP Library</h3>
          <p className="text-richblack-400 text-xs mt-1">
            Access practice questions, formula sheets, assignments and PDF notes.
          </p>
        </div>
        {isInstructor && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <FiUploadCloud size={14} /> Upload Study Material
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study material..."
            className="w-full pl-9 pr-4 py-2 bg-richblack-900 border border-richblack-700 rounded-xl text-xs text-richblack-5 focus:outline-none focus:border-purple-500 placeholder:text-richblack-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedType("")}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              !selectedType
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-richblack-900 border-richblack-700 text-richblack-400 hover:border-richblack-600"
            }`}
          >
            All Material
          </button>
          {NOTE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                selectedType === t.value
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-richblack-900 border-richblack-700 text-richblack-400 hover:border-richblack-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material Grid / Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner mx-auto"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-richblack-700 rounded-2xl bg-richblack-900/10">
          <FiFileText className="text-3xl text-richblack-600 mx-auto mb-3" />
          <p className="text-richblack-400 text-sm font-semibold">No study material found</p>
          <p className="text-richblack-500 text-xs mt-1">
            Materials will appear here once the instructor uploads them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const typeConfig = NOTE_TYPES.find((t) => t.value === note.type) || NOTE_TYPES[0]
            return (
              <div
                key={note._id}
                className="bg-richblack-900/40 border border-richblack-700/60 rounded-2xl p-4 flex gap-4 items-center justify-between group hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <FiFileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5 ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                    <h4 className="font-bold text-sm text-richblack-5 truncate">{note.title}</h4>
                    <p className="text-[10px] text-richblack-400 mt-0.5">
                      Uploaded on {new Date(note.createdAt).toLocaleDateString()}{" "}
                      {note.downloadCount > 0 && `• ${note.downloadCount} downloads`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(note)}
                  className="p-2.5 bg-richblack-800 hover:bg-purple-600 border border-richblack-700 hover:border-purple-500 text-richblack-300 hover:text-white rounded-xl transition-all"
                  title="Download File"
                >
                  <FiDownload size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Modal (Instructor) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative bg-richblack-800 border border-richblack-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-richblack-700">
              <h2 className="text-richblack-5 font-bold text-base">Upload Study Material</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-richblack-400 hover:text-richblack-100"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-richblack-300 text-xs font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 2 Notes PDF, Formula Sheet"
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-richblack-300 text-xs font-semibold mb-1">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none"
                  required
                >
                  {NOTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-richblack-300 text-xs font-semibold mb-1">Select PDF File *</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2 text-xs text-richblack-400 focus:outline-none"
                  accept="application/pdf"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg disabled:opacity-50"
              >
                {uploading ? "Uploading file..." : "Upload Material"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
