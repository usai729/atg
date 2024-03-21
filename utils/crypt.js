const crypto = require("crypto");

function crypt(data, type, receivedIV, receivedKey) {
	let iv;
	let key;

	if (type === "dec") {
		iv = Buffer.from(receivedIV, "hex");
		key = Buffer.from(receivedKey, "base64");
	} else {
		iv = crypto.randomBytes(16);
		key = Buffer.from(
			"qkci3P33wq7d+IYOHrAmLlAt86YRc10X8VlPkWEI3v4=",
			"base64",
		);
	}

	switch (type) {
		case "enc":
			try {
				const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
				const encryptedData =
					cipher.update(data, "utf-8", "hex") + cipher.final("hex");
				return {
					iv: iv.toString("hex"),
					key: key.toString("base64"),
					encryptedData: encryptedData,
				};
			} catch (e) {
				console.log(e);
				return false;
			}
		case "dec":
			try {
				const decipher = crypto.createDecipheriv(
					"aes-256-ctr",
					key,
					iv,
				);
				return (
					decipher.update(data, "hex", "utf-8") +
					decipher.final("utf-8")
				);
			} catch (e) {
				console.log(e);
				return false;
			}
		default:
			return false;
	}
}

module.exports = crypt;
