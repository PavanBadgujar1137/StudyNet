// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT with priority to Authorization header (canonical), followed by cookies, body, query
		const authHeader =
			req.header("Authorization") ||
			req.header("authorization") ||
			req.headers?.authorization ||
			req.headers?.Authorization;

		// Collect candidate tokens in order of precedence:
		// 1. Authorization header (Bearer token) - canonical for API requests
		// 2. Cookie token - standard web session
		// 3. User token in body if explicitly named
		// 4. Query token
		// 5. req.body.token (last fallback; body.token is often used by payment gateways like PayGlocal)
		const candidateTokens = [];
		if (authHeader) {
			candidateTokens.push(authHeader.replace(/^Bearer\s+/i, ""));
		}
		if (req.cookies?.token) {
			candidateTokens.push(req.cookies.token);
		}
		if (req.body?.userToken) {
			candidateTokens.push(req.body.userToken);
		}
		if (req.body?.authToken) {
			candidateTokens.push(req.body.authToken);
		}
		if (req.query?.token) {
			candidateTokens.push(req.query.token);
		}
		if (req.body?.token) {
			candidateTokens.push(req.body.token);
		}

		if (candidateTokens.length === 0) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		let decodedUser = null;
		let lastError = null;

		for (const candidate of candidateTokens) {
			if (!candidate) continue;
			let cleanToken = String(candidate).trim();
			if (
				(cleanToken.startsWith('"') && cleanToken.endsWith('"')) ||
				(cleanToken.startsWith("'") && cleanToken.endsWith("'"))
			) {
				cleanToken = cleanToken.slice(1, -1).trim();
			}

			// A standard JWT must have 3 dot-separated segments
			if (cleanToken.split(".").length !== 3) {
				continue;
			}

			try {
				const decode = jwt.verify(cleanToken, process.env.JWT_SECRET);
				decodedUser = decode;
				break;
			} catch (err) {
				lastError = err;
			}
		}

		if (!decodedUser) {
			if (lastError) {
				console.error("[AuthMiddleware] JWT verification failed:", lastError.message);
			}
			return res
				.status(401)
				.json({ success: false, message: "token is invalid or expired" });
		}

		req.user = decodedUser;
		if (!req.user.id && req.user._id) req.user.id = req.user._id;

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

