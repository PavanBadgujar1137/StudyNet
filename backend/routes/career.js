const express = require("express");
const router = express.Router();
const {
  submitApplication,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/careerApplication");
const { auth, isAdmin } = require("../middleware/auth");

// Public route to submit an application
router.post("/apply", submitApplication);

// Admin-only routes
router.get("/applications", auth, isAdmin, getAllApplications);
router.patch("/applications/:id/status", auth, isAdmin, updateApplicationStatus);
router.put("/applications/:id/status", auth, isAdmin, updateApplicationStatus);
router.delete("/applications/:id", auth, isAdmin, deleteApplication);

module.exports = router;
