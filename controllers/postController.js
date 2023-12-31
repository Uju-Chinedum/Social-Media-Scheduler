const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
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
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: 400, message: "Error uploading media" });
    }

    const { content, scheduledDate, scheduledTime } = req.body;
    const media = req.files;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFound(`No user with id: ${userId}`);
    }

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

    res.status(StatusCodes.CREATED).json({
      data: { status: 201, message: "Post created successfully", post },
    });
  });
};

const getAllPosts = async (req, res) => {
  const queryObject = {
    user: req.user.userId,
  };

  let result = Post.find(queryObject);

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const posts = await result;

  const totalPosts = await Post.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalPosts / limit);

  res
    .status(StatusCodes.OK)
    .json({ data: { status: 200, posts, totalPosts, numOfPages } });
};

const getSinglePost = async (req, res) => {
  const {
    user: { userId },
    params: { id: postId },
  } = req;

  const post = await Post.findOne({
    _id: postId,
    user: userId,
  });
  if (!post) {
    throw new NotFound(`No post with id ${postId}`);
  }

  res.status(StatusCodes.OK).json({ data: { status: 200, post } });
};

const updatePost = async (req, res) => {
  const {
    body: { content, scheduledDate, scheduledTime },
    user: { userId },
    params: { id: postId },
    files: { media },
  } = req;

  if (!content || !media || !scheduledDate || !scheduledTime) {
    throw new BadRequest("No field can be empty");
  }

  const updateFields = {
    content,
    media,
    scheduledDate,
    scheduledTime,
  };

  const post = await Post.findByIdAndUpdate(
    { _id: postId, user: userId },
    updateFields,
    { new: true, runValidators: true }
  );
  if (!post) {
    throw new NotFound(`No post with id ${postId}`);
  }

  res.status(StatusCodes.OK).json({ data: { status: 200, post } });
};

const deletePost = async (req, res) => {
  const {
    user: { userId },
    params: { id: postId },
  } = req;

  const post = await Post.findByIdAndRemove({
    _id: postId,
    user: userId,
  });
  if (!post) {
    throw new NotFound(`No post with id ${postId}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ data: { status: 200, message: "Post deleted successfully" } });
};

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
