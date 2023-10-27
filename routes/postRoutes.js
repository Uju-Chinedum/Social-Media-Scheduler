const express = require("express");
const {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

router.route("/").get(getAllPosts).post(createPost);
router.route("/:id").get(getSinglePost).patch(updatePost).delete(deletePost);

module.exports = router;
