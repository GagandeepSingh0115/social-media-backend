const { User } = require("../models/user.model");
const {
  issueJWT,
  generateHash,
  isValidPassword,
  extractProtectedKey,
} = require("../utils/security.utils");

const userLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    let user = await User.findOne({ email, username });
    if (user) {
      const match = await isValidPassword(password, user.password);
      if (match) {
        const jwt = issueJWT(user._id);
        user = extractProtectedKey(user);
        res.status(200).json({
          success: true,
          data: { user, token: jwt.token },
        });
        res.end();
      }
    }
    return res
      .status(422)
      .json({ success: false, data: "Invalid Username/Password" });
  } catch (err) {
    res.status(500).json({ success: false, error: "something went wrong" });
  }
};

const newUser = async (req, res) => {
  try {
    let user = req.body;
    user.email = user.email.toLowerCase();
    user.username = user.username.toLowercase();
    const isAlreadyExists = await User.findOne({
      email: user.email,
      username: user.username,
    });
    if (isAlreadyExists) {
      if (user[0].email) {
        res.status(422).json({ success: false, data: "Email Already Exists" });
      }
      if (user[0].username) {
        res
          .status(422)
          .json({ success: false, data: "Username Already Exists" });
      }
    } else {
      user.password = await generateHash(user.password);
      let NewUser = new User(user);
      res.status(201).json({ success: true, data: "Sign up Successfully" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "something went wrong" });
  }
};

const userDetails = (req, res) => {
  try {
    let { user } = req;
    user = extractProtectedKey(user);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: "something went wrong" });
  }
};

const changeUsername = async (req, res) => {
  try {
    let { user } = req;
    const { newName } = req.body;
    user.name = newName;
    const updatedUser = await user.save();
    res.status(200).json({ success: true, data: "Successfull Update" });
  } catch (err) {
    res.status(500).json({ success: false, error: "something went wrong" });
  }
};
const chnagePassword = async (req, res) => {
  try {
    let { user } = req;
    const { oldPassword, newPassword } = req.body;
    const match = await isValidPassword(oldPassword, user.password);
    if (match) {
      user.password = await generateHash(newPassword);
      const updatedUser = await user.save();
      res.status(200).json({ success: true, data: "Successfull Update" });
    } else {
      res
        .status(422)
        .json({ success: false, data: "Old password isn't valid" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "something went wrong" });
  }
};

module.exports = {
  userDetails,
  newUser,
  userLogin,
  changeUsername,
  chnagePassword,
};
