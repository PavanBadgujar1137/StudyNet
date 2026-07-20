import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  FiCalendar, FiClock, FiPlus, FiTrash2, FiVideo, FiX,
  FiActivity, FiCheck,
} from "react-icons/fi"
import toast from "react-hot-toast"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import {
  scheduleLiveClass,
  getInstructorSchedule,
  cancelClass,
  publishRecording,
} from "../../../services/operations/liveClassAPI"
import InstructorCalendar from "../LiveClass/InstructorCalendar"

export default function SchedulingDashboard() {
  const { token } = useSelector((s) => s.auth)

  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({ upcomingToday: 0, avgAttendance: 0, totalScheduled: 0 })
  const [loading, setLoading] = useState(true)

  // Modals / Panels
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)

  // Scheduling Form State
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    tags: "",
    scheduledStart: "",
    scheduledEnd: "",
    chatEnabled: true,
    maxAttendees: "",
    recurrence: "none", // none, daily, weekly
    recurrenceEndDate: "",
  })

  // Post class recording publishing state
  const [recordingUrl, setRecordingUrl] = useState("")

  const loadData = async () => {
    setLoading(true)
    const coursesData = await fetchInstructorCourses(token)
    setCourses(coursesData)

    const scheduleData = await getInstructorSchedule(token)
    setClasses(scheduleData.classes)
    setStats(scheduleData.stats)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleCreateClass = async (e) => {
    e.preventDefault()
    if (!formData.courseId || !formData.title || !formData.scheduledStart || !formData.scheduledEnd) {
      toast.error("Please fill in all required fields")
      return
    }

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
    }

    const res = await scheduleLiveClass(token, payload)
    if (res) {
      setScheduleModalOpen(false)
      // reset form
      setFormData({
        courseId: "",
        title: "",
        description: "",
        tags: "",
        scheduledStart: "",
        scheduledEnd: "",
        chatEnabled: true,
        maxAttendees: "",
        recurrence: "none",
        recurrenceEndDate: "",
      })
      loadData()
    }
  }

  const handleCancelClass = async (classId) => {
    if (window.confirm("Are you sure you want to cancel this class? Students will be notified via email.")) {
      const success = await cancelClass(token, classId)
      if (success) {
        setSelectedClass(null)
        loadData()
      }
    }
  }

  const handlePublishRecording = async (e) => {
    e.preventDefault()
    if (!recordingUrl.trim()) return

    const res = await publishRecording(token, selectedClass._id, recordingUrl.trim())
    if (res) {
      toast.success("Recording published!")
      setRecordingUrl("")
      setSelectedClass(null)
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="text-richblack-5 space-y-6">
      {/* Welcome & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-richblack-5">Scheduling & Timetables</h2>
          <p className="text-richblack-400 text-sm mt-1">
            Schedule live class rooms, recurring courses and link recorded lectures.
          </p>
        </div>
        <button
          onClick={() => setScheduleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-950/30"
        >
          <FiPlus size={16} /> Schedule Live Class
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-richblack-800 border border-richblack-700/60 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <FiVideo size={24} />
          </div>
          <div>
            <p className="text-richblack-400 text-xs font-semibold">Upcoming Today</p>
            <p className="text-2xl font-bold mt-1">{stats.upcomingToday}</p>
          </div>
        </div>

        <div className="bg-richblack-800 border border-richblack-700/60 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
            <FiActivity size={24} />
          </div>
          <div>
            <p className="text-richblack-400 text-xs font-semibold">Avg Attendance Rate</p>
            <p className="text-2xl font-bold mt-1">{stats.avgAttendance || 0} students</p>
          </div>
        </div>

        <div className="bg-richblack-800 border border-richblack-700/60 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <FiCalendar size={24} />
          </div>
          <div>
            <p className="text-richblack-400 text-xs font-semibold">Total Scheduled</p>
            <p className="text-2xl font-bold mt-1">{stats.totalScheduled}</p>
          </div>
        </div>
      </div>

      {/* Calendar Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Monthly Calendar */}
        <div className="lg:col-span-2">
          <InstructorCalendar classes={classes} onSelectClass={setSelectedClass} />
        </div>

        {/* Right 1 col: Upcoming agenda / Class detail panel */}
        <div className="space-y-4">
          {selectedClass ? (
            <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-richblack-700 pb-3">
                <h3 className="font-bold text-richblack-5 text-sm uppercase tracking-wider text-purple-400">
                  Class Details
                </h3>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-richblack-400 hover:text-richblack-100 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-base text-richblack-5">{selectedClass.title}</h4>
                <p className="text-richblack-400 text-xs mt-1">{selectedClass.description}</p>
              </div>

              <div className="space-y-2 text-xs text-richblack-300">
                <p className="flex items-center gap-2">
                  <FiCalendar size={13} className="text-purple-400" />
                  <strong>Date:</strong> {new Date(selectedClass.scheduledStart).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <FiClock size={13} className="text-blue-400" />
                  <strong>Time:</strong>{" "}
                  {new Date(selectedClass.scheduledStart).toLocaleTimeString()} -{" "}
                  {new Date(selectedClass.scheduledEnd).toLocaleTimeString()}
                </p>
                <p className="flex items-center gap-2">
                  <FiVideo size={13} className="text-green-400" />
                  <strong>Status:</strong>{" "}
                  <span className={`capitalize font-semibold ${selectedClass.status === "live" ? "text-red-400 animate-pulse" : "text-purple-400"}`}>
                    {selectedClass.status}
                  </span>
                </p>
              </div>

              {/* Class actions */}
              {selectedClass.status === "scheduled" && (
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      // Navigate to classroom to start streaming
                      window.open(`/live/${selectedClass._id}`, "_blank")
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all text-center"
                  >
                    Enter Classroom
                  </button>
                  <button
                    onClick={() => handleCancelClass(selectedClass._id)}
                    className="p-2 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded-lg text-xs font-medium transition-all"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}

              {selectedClass.status === "live" && (
                <button
                  onClick={() => window.open(`/live/${selectedClass._id}`, "_blank")}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold animate-pulse text-center"
                >
                  🟢 JOIN LIVE CLASS
                </button>
              )}

              {/* Publish recording section if class ended */}
              {selectedClass.status === "ended" && (
                <div className="border-t border-richblack-700 pt-4 space-y-3">
                  <p className="text-richblack-200 text-xs font-bold uppercase tracking-wider">
                    Post-Class panel
                  </p>
                  {selectedClass.isRecordingPublished ? (
                    <div className="flex items-center gap-1.5 text-green-400 text-xs">
                      <FiCheck size={14} /> Recording is published and available for students.
                    </div>
                  ) : (
                    <form onSubmit={handlePublishRecording} className="space-y-2">
                      <label className="text-richblack-400 text-xs">Upload/Link recorded video URL</label>
                      <input
                        type="url"
                        value={recordingUrl}
                        onChange={(e) => setRecordingUrl(e.target.value)}
                        placeholder="https://cloudinary.com/...mp4"
                        className="w-full bg-richblack-900 border border-richblack-700 rounded-lg px-2.5 py-1.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-richblack-700 hover:bg-richblack-600 text-richblack-200 rounded-lg text-xs font-medium transition-all"
                      >
                        Publish Recording
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 shadow-xl">
              <h3 className="font-bold text-richblack-5 text-sm uppercase tracking-wider mb-4 text-purple-400">
                Live Class Agenda
              </h3>
              {classes.filter((c) => c.status !== "ended" && c.status !== "cancelled").slice(0, 5).length === 0 ? (
                <p className="text-richblack-500 text-xs py-4 text-center">No upcoming live classes</p>
              ) : (
                <div className="space-y-3">
                  {classes
                    .filter((c) => c.status !== "ended" && c.status !== "cancelled")
                    .slice(0, 5)
                    .map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="p-3 bg-richblack-900/40 border border-richblack-700 hover:border-purple-500/30 rounded-xl cursor-pointer transition-all"
                      >
                        <p className="text-richblack-100 text-xs font-bold truncate">{cls.title}</p>
                        <p className="text-[10px] text-richblack-400 mt-1 flex items-center gap-1">
                          <FiClock size={10} />{" "}
                          {new Date(cls.scheduledStart).toLocaleDateString()}{" "}
                          {new Date(cls.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule Class Modal ──────────────────────────────────────────────── */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative bg-richblack-800 border border-richblack-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-richblack-700">
              <h2 className="text-richblack-5 font-bold text-lg">Schedule New Live Class</h2>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-richblack-400 hover:text-richblack-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateClass} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-richblack-300 text-xs font-medium mb-1">
                  Select Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-richblack-300 text-xs font-medium mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Physics - Lecture 3: Kinematics"
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-richblack-300 text-xs font-medium mb-1">
                  Description / Topic Details
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what topics will be covered..."
                  rows={2}
                  className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-richblack-300 text-xs font-medium mb-1">
                    Scheduled Start *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledStart}
                    onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                    className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-richblack-300 text-xs font-medium mb-1">
                    Scheduled End *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledEnd}
                    onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                    className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-richblack-300 text-xs font-medium mb-1">
                    Recurrence Group
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                  >
                    <option value="none">No Recurrence</option>
                    <option value="daily">Daily Series</option>
                    <option value="weekly">Weekly Series</option>
                  </select>
                </div>
                {formData.recurrence !== "none" && (
                  <div>
                    <label className="block text-richblack-300 text-xs font-medium mb-1">
                      Repeat Until *
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                      className="w-full bg-richblack-900 border border-richblack-700 rounded-lg p-2.5 text-xs text-richblack-5 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg"
              >
                Schedule Class Series
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

