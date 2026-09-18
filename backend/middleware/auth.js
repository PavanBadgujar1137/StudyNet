// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body, query or headers
		const authHeader =
			req.header("Authorization") ||
			req.header("authorization") ||
			req.headers?.authorization ||
			req.headers?.Authorization;

		let rawToken =
			req.cookies?.token ||
			req.body?.token ||
			(authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null);

		if (!rawToken && req.query?.token) {
			rawToken = req.query.token;
		}

		// If JWT is missing, return 401 Unauthorized response
		if (!rawToken) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		// Strip any surrounding quotes or whitespace (e.g. from JSON.stringify)
		let cleanToken = String(rawToken).trim();
		if ((cleanToken.startsWith('"') && cleanToken.endsWith('"')) || (cleanToken.startsWith("'") && cleanToken.endsWith("'"))) {
			cleanToken = cleanToken.slice(1, -1).trim();
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = jwt.verify(cleanToken, process.env.JWT_SECRET);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
			if (!req.user.id && req.user._id) req.user.id = req.user._id;
		} catch (error) {
			console.error("[AuthMiddleware] JWT verification failed:", error.message);
			return res
				.status(401)
				.json({ success: false, message: "token is invalid or expired" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};
exports.isStudent = async (req, res, next) => {
	try {
		const userType = String(req.user?.accountType || req.user?.role || '').toLowerCase();
		if (userType === "student" || userType === "client" || userType === "learner" || userType === "admin") {
			return next();
		}

		const userDetails = (req.user?.id ? await User.findById(req.user.id) : null) || (req.user?.email ? await User.findOne({ email: req.user.email }) : null);
		const dbType = String(userDetails?.accountType || '').toLowerCase();
		if (dbType !== "student" && dbType !== "client" && dbType !== "learner" && dbType !== "admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Learners/Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

exports.isClient = exports.isStudent;

exports.isAdmin = async (req, res, next) => {
	try {
		const userType = String(req.user?.accountType || req.user?.role || '').toLowerCase();
		if (userType === "admin") {
			return next();
		}

		const userDetails = (req.user?.id ? await User.findById(req.user.id) : null) || (req.user?.email ? await User.findOne({ email: req.user.email }) : null);

		if (String(userDetails?.accountType || '').toLowerCase() !== "admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

exports.isInstructor = async (req, res, next) => {
	try {
		const userAccountType = String(req.user?.accountType || req.user?.role || '').toLowerCase();
		if (userAccountType === "instructor" || userAccountType === "practitioner" || userAccountType === "admin") {
			return next();
		}

		const userDetails = (req.user?.id ? await User.findById(req.user.id) : null) || (req.user?.email ? await User.findOne({ email: req.user.email }) : null);

		if (!userDetails) {
			return res.status(401).json({
				success: false,
				message: "User account not found",
			});
		}

		const dbType = String(userDetails.accountType || '').toLowerCase();
		if (dbType !== "instructor" && dbType !== "practitioner" && dbType !== "admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Practitioners/Instructors",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

exports.isPractitioner = exports.isInstructor;

exports.isOrgAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "OrgAdmin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for OrgAdmin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

