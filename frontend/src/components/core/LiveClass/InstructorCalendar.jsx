import React, { useState } from "react"
import { FiChevronLeft, FiChevronRight, FiVideo } from "react-icons/fi"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const InstructorCalendar = ({ classes = [], onSelectClass }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get the first day of the month and number of days in the month
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  // Generate date cells
  const dateCells = []

  // Padding for days from the previous month
  for (let i = 0; i < firstDayIndex; i++) {
    dateCells.push({ date: null, currentMonth: false })
  }

  // Days of the current month
  for (let day = 1; day <= totalDays; day++) {
    dateCells.push({
      date: new Date(year, month, day),
      currentMonth: true,
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getClassesForDate = (date) => {
    if (!date) return []
    return classes.filter((cls) => {
      const clsDate = new Date(cls.scheduledStart)
      return (
        clsDate.getDate() === date.getDate() &&
        clsDate.getMonth() === date.getMonth() &&
        clsDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const monthName = currentDate.toLocaleString("default", { month: "long" })

  return (
    <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 shadow-xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-richblack-5 font-bold text-lg">
          {monthName} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-richblack-700 hover:bg-richblack-600 rounded-lg text-richblack-100 transition-all"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-richblack-700 hover:bg-richblack-600 rounded-lg text-richblack-100 transition-all"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-richblack-400 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-2">
        {dateCells.map((cell, index) => {
          const dateClasses = getClassesForDate(cell.date)
          const isToday =
            cell.date &&
            cell.date.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                cell.currentMonth
                  ? isToday
                    ? "bg-purple-950/20 border-purple-500/50"
                    : "bg-richblack-900/40 border-richblack-700/60 hover:border-richblack-600"
                  : "bg-transparent border-transparent opacity-20"
              }`}
            >
              {cell.date ? (
                <>
                  <span
                    className={`text-xs font-bold self-start px-2 py-0.5 rounded-full ${
                      isToday
                        ? "bg-purple-500 text-white"
                        : "text-richblack-300"
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {/* Classes previews */}
                  <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                    {dateClasses.map((cls) => (
                      <button
                        key={cls._id}
                        onClick={() => onSelectClass(cls)}
                        className={`w-full text-left text-[10px] p-1.5 rounded-md truncate block font-medium border ${
                          cls.status === "live"
                            ? "bg-red-500/20 border-red-500/30 text-red-400 animate-pulse"
                            : cls.status === "ended"
                            ? "bg-richblack-700/40 border-richblack-600/30 text-richblack-400"
                            : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <FiVideo size={8} />
                          {cls.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InstructorCalendar
