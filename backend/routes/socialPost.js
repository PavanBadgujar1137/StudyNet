const express = require("express")
const router = express.Router()
const {
  createPost,
  updatePost,
  getPractitionerPosts,
  publishPostNow,
  deletePost,
  getSocialAccounts,
  toggleSocialAccountConnection,
} = require("../controllers/socialPost")
const { auth, isPractitioner } = require("../middleware/auth")

router.post("/create", auth, isPractitioner, createPost)
router.put("/update/:postId", auth, isPractitioner, updatePost)
router.put("/:postId", auth, isPractitioner, updatePost)
router.get("/mine", auth, isPractitioner, getPractitionerPosts)

router.post("/:postId/publish", auth, isPractitioner, publishPostNow)
router.delete("/:postId", auth, isPractitioner, deletePost)

router.get("/accounts", auth, isPractitioner, getSocialAccounts)
router.post("/accounts/toggle", auth, isPractitioner, toggleSocialAccountConnection)

module.exports = router
