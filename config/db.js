const mongoose = require("mongoose");
require("dotenv").config()

async function connect() {
    try {
        await mongoose.connect(process.env.DB_URL);

        console.log(`Connected to database@${process.env.DB_URL}`);
    } catch (e) {
        console.log(e);
    }
}

module.exports = connect;