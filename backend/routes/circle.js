const express = require("express")
const router = express.Router()
const {
  getAllCircles,
  createCircle,
  updateCircle,
  deleteCircle,
  joinCircle,
  getCohortDetail,
  updateKanbanStage,
  postToFeed,
} = require("../controllers/circle")
const { auth, isPractitioner } = require("../middleware/auth")

router.get("/all", getAllCircles)
router.post("/create", auth, isPractitioner, createCircle)
router.put("/:cohortId", auth, isPractitioner, updateCircle)
router.delete("/:cohortId", auth, isPractitioner, deleteCircle)
router.post("/:cohortId/join", auth, joinCircle)

router.get("/:cohortId", auth, getCohortDetail)
router.patch("/:cohortId/stage", auth, updateKanbanStage)
router.post("/:cohortId/feed", auth, postToFeed)

module.exports = router
