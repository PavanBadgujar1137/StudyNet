const mongoose = require("mongoose")

// Define the Courses schema
const coursesSchema = new mongoose.Schema({
  courseName: { type: String },
  courseDescription: { type: String },
  instructorDescription: { type: String },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: "Category",
  },
  studentsEnroled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
  // Unified Course/Batch Fields
  startDate: { type: Date },
  endDate: { type: Date },
  validityDays: { type: Number, default: 365 },
  emiAvailable: { type: Boolean, default: false },
  emiPlans: [
    {
      installments: { type: Number, required: true },
      amountPerInstallment: { type: Number, required: true },
      intervalDays: { type: Number, default: 30 },
      label: { type: String },
    }
  ],
  liveClasses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveClass",
    }
  ],
  language: {
    type: String,
    enum: ["Hindi", "English", "Hinglish", "Tamil", "Telugu", "Bengali", "Marathi"],
    default: "English",
  },
  timetableTemplate: [
    {
      dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      subject: { type: String, default: "" },
      topic: { type: String, default: "" },
    }
  ],
  createdAt: { type: Date, default: Date.now },
})


// Export the Courses model
module.exports = mongoose.model("Course", coursesSchema)
