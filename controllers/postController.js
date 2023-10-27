const createPost = async (req, res) => {
  res.send("create post");
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
