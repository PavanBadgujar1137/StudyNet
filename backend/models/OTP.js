const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Create a transporter to send emails

	// Define the email options

	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse.response);

		// Multi-Channel WhatsApp OTP Delivery
		try {
			const User = require("./User");
			const existingUser = await User.findOne({ email }).select("contactNumber whatsappNumber additionalDetails");
			const phone = existingUser?.whatsappNumber || existingUser?.contactNumber || existingUser?.additionalDetails?.contactNumber;
			if (phone) {
				const { sendWhatsAppMessage } = require("../utils/whatsappSender");
				const waText = `🔐 *OpenHand Verification Code*\n\nYour security code is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.`;
				sendWhatsAppMessage(phone, waText).catch(e => console.warn("OTP WA send warning:", e.message));
			}
		} catch (waErr) {
			console.warn("OTP WA lookup warning:", waErr.message);
		}
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Send email before saving a new OTP document
OTPSchema.pre("save", async function () {
	if (!this.isNew) {
		return
	}

	console.log("Sending OTP email to:", this.email)
	await sendVerificationEmail(this.email, this.otp)
	console.log("OTP email queued/sent for:", this.email)
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
