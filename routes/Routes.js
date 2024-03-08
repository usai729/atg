const { body } = require("express-validator");
const { login, register, forgotPassword, resetPassword } = require("../controllers/user.controllers");

const Router = require("express").Router();

Router.route("/login").post([body("identificationID").notEmpty(), body("password").notEmpty()], login)
Router.route("/register").post([body("email").notEmpty().isEmail(), body("username").notEmpty(), body("password").notEmpty()], register)
Router.route("/forgot-password").post([body("email").isEmail()], forgotPassword);
Router.route("/reset-password").post([body("new_pwd").notEmpty()], resetPassword)

module.exports = Router;