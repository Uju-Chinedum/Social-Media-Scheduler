const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Post = require("../models/Post");
const multer = require("multer");
const { BadRequest, NotFound } = require("../errors");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

const createPost = async (req, res) => {
  const { userId } = req.user;

  await upload.array("media")(req, res, async (err) => {
    if (err) {
      throw new BadRequest("Error uploading media");
    }

    const { content, scheduledDate, scheduledTime } = req.body;
    const media = req.files;

    // Ensure user exists and has valid credentials
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFound(`No user with id: ${userId}`);
    }

    // Create the post object
    const post = await Post.create({
      user: user._id,
      content,
      media: media.map((file) => ({
        type: file.mimetype.startsWith("image/") ? "image" : "video",
        filePath: file.path,
      })),
      scheduledDate,
      scheduledTime,
    });

    // Increment the user's numOfPosts count
    user.numOfPosts++;
    await user.save();

    res.status(StatusCodes.CREATED).json({ message: "Post created successfully", post });
  });
};

const getAllPosts = async (req, res) => {
  res.send("get all posts");
};

const getSinglePost = async (req, res) => {
  res.send("get single post");
};

const updatePost = async (req, res) => {
  res.send("update post");
};

const deletePost = async (req, res) => {
  res.send("delete post");
};

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
