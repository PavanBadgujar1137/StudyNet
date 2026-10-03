const mongoose = require("mongoose");

// Define the RatingAndReview schema
const ratingAndReviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "user",
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		review: {
			type: String,
			required: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			index: true,
		},
		practitioner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
			index: true,
		},
		isApproved: {
			type: Boolean,
			default: false,
			index: true,
		},
		adminRating: {
			type: Number,
			min: 1,
			max: 5,
		},
		adminNotes: {
			type: String,
		},
		verifiedAt: {
			type: Date,
		},
		verifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
	},
	{ timestamps: true }
);

// Export the RatingAndReview model
module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
