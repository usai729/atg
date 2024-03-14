const { body } = require("express-validator");
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  follow,
  getFollowing,
  getFollowers,
} = require("../controllers/user.controllers");
const PostRoutes = require("./posts.route");
const { JWTverification } = require("../utils/jwtVerification");

const Router = require("express").Router();

Router.route("/login").post(
  [body("identificationID").notEmpty(), body("password").notEmpty()],
  login
);
Router.route("/register").post(
  [
    body("email").notEmpty().isEmail(),
    body("username").notEmpty(),
    body("password").notEmpty(),
  ],
  register
);
Router.route("/forgot-password").post(
  [body("email").isEmail()],
  forgotPassword
);
Router.route("/reset-password").post(
  [body("new_pwd").notEmpty()],
  resetPassword
);

Router.route("/follow").put(JWTverification, follow);
Router.route("/following/:id").get(JWTverification, getFollowing);
Router.route("/followers/:id").get(JWTverification, getFollowers);

Router.use("/p", PostRoutes);

module.exports = Router;
