const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});
const usermodel = mongoose.model("User", UserSchema);

const ResetTokensSchema = new mongoose.Schema({
  token_data: {
    token: {
      type: String,
    },
    expiresIn: {
      type: Date,
    },
  },
  added: {
    type: Date,
    default: Date.now,
  },
});
const resettokenmodel = mongoose.model("ResetTokens", ResetTokensSchema);

const followingSchema = new mongoose.Schema({
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const followingModel = mongoose.model("Following", followingSchema);

const followerSchema = new mongoose.Schema({
  follower: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const followerModel = mongoose.model("Follower", followerSchema);

module.exports = {
  User: usermodel,
  ResetTokens: resettokenmodel,
  Following: followingModel,
  Follower: followerModel,
};
