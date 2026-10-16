import React, { useEffect, useState } from "react"
import { FiUsers, FiUser } from "react-icons/fi"

const ROLE_COLORS = {
  instructor: "text-purple-400 font-semibold",
  ta: "text-green-400 font-semibold",
  student: "text-richblack-200",
}

const ROLE_LABELS = {
  instructor: "Instructor",
  ta: "TA",
  student: "Student",
}

const AttendeeList = ({ socket }) => {
  const [attendees, setAttendees] = useState([])

  useEffect(() => {
    if (!socket) return

    const handleAttendeeUpdate = (data) => {
      setAttendees(data.attendees || [])
    }

    const handleRoomJoined = (data) => {
      setAttendees(data.attendees || [])
    }

    socket.on("attendee-update", handleAttendeeUpdate)
    socket.on("room-joined", handleRoomJoined)

    return () => {
      socket.off("attendee-update", handleAttendeeUpdate)
      socket.off("room-joined", handleRoomJoined)
    }
  }, [socket])

  return (
    <div className="flex flex-col h-full bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-richblack-700 bg-richblack-800">
        <FiUsers className="text-purple-400" size={16} />
        <span className="text-richblack-100 font-semibold text-sm">Active Attendees</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
          {attendees.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-track-richblack-800 scrollbar-thumb-richblack-600">
        {attendees.length === 0 ? (
          <div className="text-center text-richblack-500 text-xs py-8">
            Nobody in class yet
          </div>
        ) : (
          attendees.map((attendee, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 hover:bg-richblack-700/30 rounded-xl transition-all"
            >
              <div className="p-1.5 rounded-lg bg-richblack-700 text-richblack-300">
                <FiUser size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate ${ROLE_COLORS[attendee.role] || ROLE_COLORS.student}`}>
                  {attendee.userName}
                </p>
                {attendee.role !== "student" && (
                  <span className="text-[9px] px-1 bg-purple-500/10 rounded text-purple-400 uppercase font-bold">
                    {ROLE_LABELS[attendee.role]}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AttendeeList
