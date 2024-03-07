const { body } = require("express-validator");
const { login, register } = require("../controllers/user.controllers");

const Router = require("express").Router();

Router.route("/login").post([body("identificationID").notEmpty(), body("password").notEmpty()], login)
Router.route("/register").post([body("email").notEmpty().isEmail(), body("username").notEmpty(), body("password").notEmpty()], register)

module.exports = Router;