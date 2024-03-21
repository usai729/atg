const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { Post, Comment } = require("../Models/posts.model");
const crypt = require("../utils/crypt");

function genToken(id) {
	const token = jwt.sign(
		{
			id: id,
		},
		process.env.JWT_SECRET,
	);

	return token;
}

exports.create = async (req, res) => {
	const { post } = req.body;

	const encyrpted = crypt(post, "enc");

	try {
		Post.create({
			post: encyrpted.encryptedData,
			by: req.user.id,
			"crypt.iv": encyrpted.iv,
			"crypt.key": encyrpted.key,
		})
			.then((post) => {
				return res.status(200).json({
					msg: "success/post-created",
					token: genToken(post.id),
					encryptedPost: post.post,
				});
			})
			.catch((e) => {
				throw e;
			});
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.editPost = async (req, res) => {
	const { newContent } = req.body;
	const { id } = req.params;

	const encyrpted = crypt(newContent, "enc");

	try {
		const post = await Post.findByIdAndUpdate(id, {
			$set: {
				post: encyrpted.encryptedData,
				edited: true,
				"crypt.iv": encyrpted.iv,
				"crypt.key": encyrpted.key,
			},
		});

		return res.status(200).json({
			msg: "success/post-edited",
			token: genToken(post.id),
			encryptedPost: post.post,
		});
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.like = async (req, res) => {
	const { id } = req.body;

	var message;

	const post = await Post.findOne({ _id: id });

	if (!post) {
		return res.status(404).json({ msg: "err/post-not-found" });
	}

	try {
		if (post.likes.likeBy.indexOf(req.user.id) !== -1) {
			await Post.findByIdAndUpdate(id, {
				$pull: { "likes.likeBy": req.user.id },
				$inc: { "likes.count": -1 },
			});

			message = "success/post-unliked";
		} else {
			await Post.findByIdAndUpdate(id, {
				$addToSet: { "likes.likeBy": req.user.id },
				$inc: { "likes.count": 1 },
			});

			message = "success/post-liked";
		}

		return res.status(200).json({ msg: message, token: genToken(post.id) });
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.deletePost = async (req, res) => {
	const { id } = req.params;

	const post = await Post.findOne({ _id: id });
	const postId = post.id;

	if (!post) {
		return res.status(404).json({ msg: "err/post-not-found" });
	}

	try {
		await post.deleteOne();
		await Comment.findOneAndDelete({ to: id });

		return res
			.status(200)
			.json({ msg: "success/post-deleted", token: genToken(postId) });
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.getPosts = async (req, res) => {
	try {
		const posts = await Post.find().populate("by").populate("likes.likeBy");

		const decryptedPosts = posts.map((post) => {
			return {
				posts: [
					{
						posts: crypt(
							post.post,
							"dec",
							post.crypt.iv,
							post.crypt.key,
						),
					},
					{ by: post.by },
					{ likes: post.likes },
				],
				token: genToken(post.id),
			};
		});

		return res
			.status(200)
			.json({ msg: "success/fetched-posts", decryptedPosts });
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.getPost = async (req, res) => {
	const { id } = req.params;

	try {
		const posts = await Post.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(id) } },
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "to",
					as: "comments",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "by",
					foreignField: "_id",
					as: "by",
				},
			},
			{ $unwind: "$by" },
			{
				$group: {
					_id: "$_id",
					post: { $first: "$post" },
					likes: { $first: "$likes" },
					iv: { $first: "$crypt.iv" },
					key: { $first: "$crypt.key" },
					by: { $first: "$by" },
					edited: { $first: "$edited" },
					dateAdded: { $first: "$dateAdded" },
					comments: { $push: "$comments" },
				},
			},
		]);

		const decryptedPost = crypt(
			posts[0].post,
			"dec",
			posts[0].iv,
			posts[0].key,
		);

		var decryptedComments;
		if (posts[0].comments[0][0]) {
			decryptedComments = posts[0].comments[0].map((comment) => {
				return {
					...comment,
					comment: crypt(
						comment.comment,
						"dec",
						comment.crypt.iv,
						comment.crypt.key,
					),
				};
			});
		} else {
			decryptedComments = {};
		}

		const responseData = {
			...posts[0],
			post: decryptedPost,
			comments: decryptedComments,
			token: genToken(posts[0]._id),
		};

		return res.status(200).json({
			msg: "success/fetched-post",
			data: responseData,
		});
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.addComment = async (req, res) => {
	const { comment, id } = req.body;

	const post = await Post.findOne({ _id: id });

	if (!post) {
		return res.status(404).json({ msg: "err/post-not-found" });
	}

	const encrypted = crypt(comment, "enc");

	try {
		const comment = await Comment.create({
			to: id,
			comment: encrypted.encryptedData,
			by: req.user.id,
			"crypt.iv": encrypted.iv,
			"crypt.key": encrypted.key,
		});

		return res.status(200).json({
			msg: "success/comment-added",
			token: genToken(comment.id),
		});
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};
