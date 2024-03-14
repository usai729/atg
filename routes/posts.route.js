const {
	create,
	editPost,
	like,
	deletePost,
	getPosts,
	getPost,
	addComment,
} = require("../controllers/post.controller");
const { JWTverification } = require("../utils/jwtVerification");

const Router = require("express").Router();

Router.route("/create/post").post(JWTverification, create);
Router.route("/edit/post/:id").put(JWTverification, editPost);
Router.route("/like/post").put(JWTverification, like);
Router.route("/del/post/:id").delete(JWTverification, deletePost);
Router.route("/posts").get(JWTverification, getPosts);
Router.route("/posts/:id").get(JWTverification, getPost);

Router.route("/create/comment").post(JWTverification, addComment);
Router.route("/like/comment").put(JWTverification);

module.exports = Router;
