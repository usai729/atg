const {
  User,
  ResetTokens,
  Following,
  Follower,
} = require("../Models/user.model");
const sendMail = require("../utils/mailer");

const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors?.isEmpty()) {
    return res.json({ msg: "err/invalid-request-parameters", errors });
  }

  const exists = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (exists) {
    return res.status(409).json({ msg: "err/user-already-exists." });
  }

  try {
    let salt = await bcrypt.genSalt();
    let hash = await bcrypt.hash(password, salt);

    User.create({
      username: username,
      email: email,
      password: hash,
    })
      .then(async (user) => {
        await Following.create({
          of: user.id,
        });
        await Follower.create({
          of: user.id,
        });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return res
          .status(200)
          .json({ msg: "success/user-successfully-registered", token: token });
      })
      .catch((e) => {
        throw new Error(`Error creating user \n ${e}`);
      });
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};

exports.login = async (req, res) => {
  const { identificationID, password } = req.body;
  const errors = validationResult(req);

  if (!errors?.isEmpty()) {
    return res.json({ msg: "err/invalid-request-parameters", errors });
  }

  const exists = await User.findOne({
    $or: [{ username: identificationID }, { email: identificationID }],
  });

  if (!exists) {
    return res.status(409).json({ msg: "err/user-does-not-exist" });
  }

  try {
    const compare = await bcrypt.compare(password, exists.password);

    if (!compare) {
      return res.status(401).json({ msg: "err/invalid-credentials" });
    }

    const token = jwt.sign({ id: exists._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ msg: "success/login-success", token: token });
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors?.isEmpty()) {
    return res.json({ msg: "err/invalid-request-parameters", errors });
  }

  const exists = await User.findOne({ email: email });

  if (!exists) {
    return res.status(409).json({ msg: "err/user-does-not-exist" });
  }

  try {
    const currentDate = new Date();
    const newDate = new Date(currentDate.getTime() + 15 * 60000);

    var pwd_token = crypto.randomBytes(64).toString("hex");

    let data = {
      token: pwd_token,
      expiresIn: newDate,
    };

    await ResetTokens.create({
      token_data: data,
    });
    let html = `<p>To reset your password, click on the link below.<br>The link is valid for <b>15 Minutes</b><br><a href='http://localhost:3000/reset-password?resettoken=${pwd_token}'>Reset password</a></p>`;

    await sendMail("Password Reset", html, email);
    return res.json({ msg: "success/rest-link-sent", reset_token: data });
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { new_pwd, email } = req.body;
  const { token } = req.headers;

  const exists = await ResetTokens.findOne({ "token_data.token": token });

  if (!exists) {
    return res.status(409).json({ msg: "err/invalid-password-reset-token" });
  }

  try {
    if (exists.token_data.expiresIn < Date.now()) {
      return res
        .status(410)
        .json({ msg: "err/password-reset-link-is-expired" });
    }

    const user = await User.findOne({ email: email });

    if (user) {
      let salt = await bcrypt.genSalt();
      let hash = await bcrypt.hash(new_pwd, salt);

      await user.updateOne({ password: hash });

      return res.status(200).json({ msg: "success/password-changed" });
    } else {
      return res.status(400).json({ msg: "success/user-not-found" });
    }
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};

exports.follow = async (req, res) => {
  const { id } = req.body;
  var message;

  try {
    const alreadyFollowing = await Following.findOne({
      $and: [{ following: { $in: [id] } }, { _id: req.user.id }],
    });

    if (alreadyFollowing) {
      await Following.updateOne(
        { of: req.user.id },
        {
          $pull: { following: id },
        }
      );
      await Follower.updateOne(
        { of: id },
        {
          $pull: { follower: req.user.id },
        }
      );

      message = "success/followed";
    } else {
      await Following.updateOne(
        { of: req.user.id },
        {
          $push: { following: id },
        }
      );
      await Follower.updateOne(
        { of: id },
        {
          $push: { follower: req.user.id },
        }
      );

      message = "success/unfollowed";
    }

    return res.status(200).json({ msg: message });
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};

exports.getFollowing = async (req, res) => {
  const { id } = req.params;

  try {
    const following = await Following.find({ of: id }).populate("following");

    return res
      .status(200)
      .json({ msg: "success/fetched-following", following });
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};

exports.getFollowers = async (req, res) => {
  const { id } = req.params;

  try {
    const follower = await Follower.find({ of: id }).populate("follower");

    return res.status(200).json({ msg: "success/fetched-follower", follower });
  } catch (e) {
    console.log(e);

    return res.status(500).json({ msg: "err/internal-server-error" });
  }
};
