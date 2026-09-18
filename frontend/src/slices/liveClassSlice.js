import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  // All classes in view (instructor schedule / student upcoming)
  classes: [],
  classesLoading: false,

  // Single class detail (used in LiveClassRoom)
  currentClass: null,
  currentClassLoading: false,

  // Zoom Meeting details for joining/starting
  zoomMeetingId: null,
  zoomJoinUrl: null,
  zoomStartUrl: null,
  zoomPassword: null,

  // Scheduling form state
  scheduleFormOpen: false,
  editingClass: null, // class being rescheduled

  // Instructor stats
  stats: {
    upcomingToday: 0,
    avgAttendance: 0,
    totalScheduled: 0,
  },

  // Active chat messages (in-memory for current session)
  chatMessages: [],

  // Live attendee list
  attendees: [],
  attendeeCount: 0,
}

const liveClassSlice = createSlice({
  name: "liveClass",
  initialState,
  reducers: {
    setClassesLoading(state, action) {
      state.classesLoading = action.payload
    },
    setClasses(state, action) {
      state.classes = action.payload
      state.classesLoading = false
    },
    setCurrentClassLoading(state, action) {
      state.currentClassLoading = action.payload
    },
    setCurrentClass(state, action) {
      state.currentClass = action.payload
      state.currentClassLoading = false
    },
    setZoomCredentials(state, action) {
      state.zoomMeetingId = action.payload.zoomMeetingId
      state.zoomJoinUrl = action.payload.zoomJoinUrl
      state.zoomStartUrl = action.payload.zoomStartUrl
      state.zoomPassword = action.payload.zoomPassword
    },
    clearZoomCredentials(state) {
      state.zoomMeetingId = null
      state.zoomJoinUrl = null
      state.zoomStartUrl = null
      state.zoomPassword = null
    },
    setStats(state, action) {
      state.stats = action.payload
    },
    openScheduleForm(state, action) {
      state.scheduleFormOpen = true
      state.editingClass = action.payload || null
    },
    closeScheduleForm(state) {
      state.scheduleFormOpen = false
      state.editingClass = null
    },
    addChatMessage(state, action) {
      state.chatMessages.push(action.payload)
      if (state.chatMessages.length > 200) {
        state.chatMessages = state.chatMessages.slice(-200)
      }
    },
    clearChat(state) {
      state.chatMessages = []
    },
    setAttendees(state, action) {
      state.attendees = action.payload.attendees || []
      state.attendeeCount = action.payload.attendeeCount || 0
    },
    updateClassInList(state, action) {
      const idx = state.classes.findIndex((c) => c._id === action.payload._id)
      if (idx >= 0) state.classes[idx] = action.payload
    },
    removeClassFromList(state, action) {
      state.classes = state.classes.filter((c) => c._id !== action.payload)
    },
  },
})

export const {
  setClassesLoading,
  setClasses,
  setCurrentClassLoading,
  setCurrentClass,
  setZoomCredentials,
  clearZoomCredentials,
  setStats,
  openScheduleForm,
  closeScheduleForm,
  addChatMessage,
  clearChat,
  setAttendees,
  updateClassInList,
  removeClassFromList,
} = liveClassSlice.actions

export default liveClassSlice.reducer
