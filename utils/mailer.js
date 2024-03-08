const nodemailer = require("nodemailer");
require("dotenv").config()

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

async function sendMail(title, html, to) {
    try {
        transporter.sendMail({
            from: process.env.EMAIL,
            to: to,
            subject: title,
            html: html
        })

        console.log(`Mail sent to ${to}`);
    } catch (e) {
        throw new Error(`Error sending mail \n ${e}`);
    }
}

module.exports = sendMail;