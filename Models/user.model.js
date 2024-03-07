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

module.exports = {
    User: usermodel
}