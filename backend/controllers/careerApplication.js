const CareerApplication = require("../models/CareerApplication");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// ── Submit Career Application (Public) ──────────────────────────────────────────
exports.submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      city,
      experience,
      currentOrg,
      linkedin,
      portfolio,
      expertise,
      coverNote,
      jobTitle,
    } = req.body;

    if (!fullName || !email || !phone || !experience || !expertise || !coverNote) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all required application fields.",
      });
    }

    let resumeUrl = "";
    let resumeName = "";

    // Check if resume file was uploaded
    if (req.files && req.files.resume) {
      const resumeFile = req.files.resume;
      resumeName = resumeFile.name || "resume.pdf";
      try {
        const uploadDetails = await uploadImageToCloudinary(
          resumeFile,
          process.env.FOLDER_NAME || "openhand-resumes"
        );
        resumeUrl = uploadDetails.secure_url || uploadDetails.url || "";
      } catch (uploadErr) {
        console.error("Resume file upload error:", uploadErr.message);
        // Continue even if S3 upload failed so application is not lost
      }
    } else if (req.body.resumeName) {
      resumeName = req.body.resumeName;
    }

    const application = await CareerApplication.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: (city || "").trim(),
      experience: String(experience).trim(),
      currentOrg: (currentOrg || "").trim(),
      linkedin: (linkedin || "").trim(),
      portfolio: (portfolio || "").trim(),
      expertise: expertise.trim(),
      coverNote: coverNote.trim(),
      jobTitle: (jobTitle || "General / Open Application").trim(),
      resumeUrl,
      resumeName,
      status: "New",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully! Our team will get in touch.",
      data: application,
    });
  } catch (error) {
    console.error("Error submitting career application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again.",
      error: error.message,
    });
  }
};

// ── Get All Career Applications (Admin Only) ───────────────────────────────────
exports.getAllApplications = async (req, res) => {
  try {
    const { search = "", status = "", jobTitle = "", page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (jobTitle && jobTitle !== "All") {
      query.jobTitle = { $regex: jobTitle, $options: "i" };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { currentOrg: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total, statsAggregation] = await Promise.all([
      CareerApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CareerApplication.countDocuments(query),
      CareerApplication.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = {
      total: await CareerApplication.countDocuments(),
      new: 0,
      inReview: 0,
      shortlisted: 0,
      interviewing: 0,
      rejected: 0,
      hired: 0,
    };

    statsAggregation.forEach((s) => {
      if (s._id === "New") stats.new = s.count;
      else if (s._id === "In Review") stats.inReview = s.count;
      else if (s._id === "Shortlisted") stats.shortlisted = s.count;
      else if (s._id === "Interviewing") stats.interviewing = s.count;
      else if (s._id === "Rejected") stats.rejected = s.count;
      else if (s._id === "Hired") stats.hired = s.count;
    });

    return res.status(200).json({
      success: true,
      applications,
      total,
      stats,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)) || 1,
    });
  } catch (error) {
    console.error("Error fetching career applications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch career applications",
      error: error.message,
    });
  }
};

// ── Update Application Status & Notes (Admin Only) ─────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const application = await CareerApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (status) {
      application.status = status;
    }
    if (adminNotes !== undefined) {
      application.adminNotes = adminNotes;
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application",
      error: error.message,
    });
  }
};

// ── Delete Application (Admin Only) ────────────────────────────────────────────
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await CareerApplication.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error: error.message,
    });
  }
};
