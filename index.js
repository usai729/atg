const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const Routes = require("./routes/Routes");
require("./config/db")();

const PORT = process.env.PORT || 3001;

const app = express();

// const key_in_bytes = Buffer.from(
// 	"qkci3P33wq7d+IYOHrAmLlAt86YRc10X8VlPkWEI3v4=",
// 	"base64",
// );
// const iv = crypto.randomBytes(16);

// const cipher = crypto.createCipheriv("aes-256-ctr", key_in_bytes, iv);
// var enc = cipher.update("helloo", "utf-8", "hex") + cipher.final("hex");

// const decipher = crypto.createDecipheriv("aes-256-ctr", key_in_bytes, iv);
// var dec = decipher.update(enc, "hex", "utf-8") + decipher.final("utf-8");

// console.log([enc, dec]);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ msg: "Hello, ATG!", url: req.url });
});
app.use("/api", Routes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}@http://localhost:${PORT}`);
});

//
