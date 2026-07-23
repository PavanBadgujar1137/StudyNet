const express = require("express")
const router = express.Router()
const { getCohortDetail, updateKanbanStage, postToFeed } = require("../controllers/circle")
const { auth } = require("../middleware/auth")

router.get("/:cohortId", auth, getCohortDetail)
router.patch("/:cohortId/stage", auth, updateKanbanStage)
router.post("/:cohortId/feed", auth, postToFeed)

module.exports = router
