const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	post: { type: String },
	dateAdded: {
		type: Date,
		default: Date.now,
	},
	likes: {
		count: {
			type: Number,
			default: 0,
		},
		likeBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
	},
	by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	edited: {
		type: Boolean,
		default: false,
	},
});
const postModel = mongoose.model("Post", postSchema);

const commentSchema = new mongoose.Schema({
	comment: { type: String },
	dateAdded: {
		type: Date,
		default: Date.now,
	},
	likes: {
		count: {
			type: Number,
			default: 0,
		},
		likeBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
	},
});
const commentModel = mongoose.model("Comment", commentSchema);

const replySchema = new mongoose.Schema({
	comment: { type: String },
	dateAdded: {
		type: Date,
		default: Date.now,
	},
	likes: {
		type: Number,
		default: 0,
	},
	by: {
		type: mongoose.Types.ObjectId,
		ref: "User",
	},
});
const replyModel = mongoose.model("Reply", replySchema);

module.exports = {
	Post: postModel,
	Comment: commentModel,
	Reply: replyModel,
};
