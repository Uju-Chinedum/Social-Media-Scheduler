const getMe = async (req, res) => {
  res.send("get me");
};

const updateUser = async (req, res) => {
  res.send("update user");
};

const deleteUser = async (req, res) => {
  res.send("delete user");
};

module.exports = { getMe, updateUser, deleteUser };
