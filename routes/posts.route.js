const { JWTverification } = require("../utils/jwtVerification");

const Router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../assets/posts");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

Router.route("/").get((req, res) => {
  res.send("Posts route");
});

Router.route("/create/post").post(JWTverification);
Router.route("/edit/post/:id").put(JWTverification);
Router.route("/like/post").put(JWTverification);
Router.route("/posts").get(JWTverification);
Router.route("/posts/:id").get(JWTverification);

Router.route("/create/comment").post(JWTverification);
Router.route("/like/comment").put(JWTverification);

module.exports = Router;
