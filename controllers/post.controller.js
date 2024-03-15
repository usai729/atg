const { default: mongoose } = require("mongoose");
const { Post, Comment, Reply } = require("../Models/posts.model");

exports.create = async (req, res) => {
	const { post } = req.body;

	try {
		Post.create({
			post: post,
			by: req.user.id,
		})
			.then(() => {
				return res.status(200).json({ msg: "success/post-created" });
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

	try {
		await Post.findByIdAndUpdate(id, {
			$set: { post: newContent, edited: true },
		});

		return res.status(200).json({ msg: "success/post-edited" });
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

		return res.status(200).json({ msg: message });
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.deletePost = async (req, res) => {
	const { id } = req.params;

	const post = await Post.findOne({ _id: id });

	if (!post) {
		return res.status(404).json({ msg: "err/post-not-found" });
	}

	try {
		await post.deleteOne();
		await Comment.findOneAndDelete({ to: id });

		return res.status(200).json({ msg: "success/post-deleted" });
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};

exports.getPosts = async (req, res) => {
	try {
		const posts = await Post.find().populate("by").populate("likes.likeBy");

		return res.status(200).json({ msg: "success/fetched-posts", posts });
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
			{ $unwind: "$comments" },
			{
				$lookup: {
					from: "replies",
					localField: "comments._id",
					foreignField: "to",
					as: "comments.replies",
				},
			},
			{
				$group: {
					_id: "$_id",
					post: { $first: "$post" },
					likes: { $first: "$likes" },
					by: { $first: "$by" },
					edited: { $first: "$edited" },
					dateAdded: { $first: "$dateAdded" },
					comments: { $push: "$comments" },
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
		]);

		return res.status(200).json({
			msg: "success/fetched-post",
			data: posts ? { posts: posts } : "err/no-posts-found",
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

	try {
		await Comment.create({
			to: id,
			comment: comment,
			by: req.user.id,
		});

		return res.status(200).json({ msg: "success/comment-added" });
	} catch (e) {
		console.log(e);

		return res.status(500).json({ msg: "err/internal-server-error" });
	}
};
