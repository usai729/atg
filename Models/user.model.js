const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    }
})
const usermodel = mongoose.model("User", UserSchema);

const ResetTokensSchema = new mongoose.Schema({
    token_data: {
        token: {
            type: String,
        },
        expiresIn: {
            type: Date,
        }
    },
    added: {
        type: Date,
        default: Date.now
    }
})
const resettokenmodel = mongoose.model("ResetTokens", ResetTokensSchema);

module.exports = {
    User: usermodel,
    ResetTokens: resettokenmodel
}