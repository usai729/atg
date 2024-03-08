const { User, ResetTokens } = require("../Models/user.model");
const sendMail = require("../utils/mailer");

const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors?.isEmpty()) {
        return res.json({msg: "err/invalid-request-parameters", errors});
    }

    const exists = await User.findOne({$or: [{username: username}, {email: email}]});

    if (exists) {
        return res.status(409).json({ msg: "err/user-already-exists." });
    }

    try {
        let salt = await bcrypt.genSalt();
        let hash = await bcrypt.hash(password, salt);

        User.create({
            username: username,
            email: email,
            password: hash
        }).then((user) => {
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({msg: "success/user-successfully-registered", token: token});
        }).catch((e) => {
            throw new Error(`Error creating user \n ${e}`);
        })  
    } catch (e) {
        console.log(e);

        return res.status(500).json({msg: "err/internal-server-error"});
    }
}

exports.login = async (req, res) => {
    const { identificationID, password } = req.body;
    const errors = validationResult(req);

    if (!errors?.isEmpty()) {
        return res.json({msg: "err/invalid-request-parameters", errors});
    }

    const exists = await User.findOne({$or: [{username: identificationID}, {email: identificationID}]});

    if (!exists) {
        return res.status(409).json({ msg: "err/user-does-not-exist" });
    }

    try {
        const compare = await bcrypt.compare(password, exists.password);

        if (!compare) {
            return  res.status(401).json({msg: "err/invalid-credentials"});
        }

        const token = jwt.sign({id: exists._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({msg: "success/login-success", token: token});
    } catch (e) {
        console.log(e);

        return res.status(500).json({msg: "err/internal-server-error"});
    }
}

exports.forgotPassword = async(req, res) => {
    const {email} = req.body;
    const errors = validationResult(req);

    if (!errors?.isEmpty()) {
        return res.json({msg: "err/invalid-request-parameters", errors});
    }

    const exists = await User.findOne({email: email});

    if (!exists) {
        return res.status(409).json({ msg: "err/user-does-not-exist" });
    }

    try {
        const currentDate = new Date();
        const newDate = new Date(currentDate.getTime() + 30 * 60000);
        
        var pwd_token = crypto.randomBytes(32).toString("hex");

        await ResetTokens.create({
            token_data: {
                token:  pwd_token,
                expiresIn: newDate
            }
        });
        let html = `<p>To reset your password, click on the link below.<br>The link is valid for 30mins<br><a href='http://localhost:3000/reset-password?resettoken=${pwd_token}'>Reset password</a></p>`;

        sendMail("Password Reset", html, email);
    } catch (e) {
        console.log(e);

        return res.status(500).json({msg: "err/internal-server-error"});
    }
}   

exports.resetPassword = async (req, res) => {
    const {new_pwd, email} = req.body;
    const {token} = req.headers;
    
    console.log(token);

    const exists = await ResetTokens.findOne({"token_data.token": token});

    if (!exists) {
        return res.status(409).json({ msg: "err/invalid-password-reset-token" });
    }

    try {
        if (exists.token_data.expiresIn < Date.now()) {
            return res.status(410).json({msg: 'err/password-reset-link-is-expired'});
        }

        const user = await User.findOne({email: email});
        
        if (user) {
            let salt = await bcrypt.genSalt();
            let hash = await bcrypt.hash(new_pwd, salt);

            await user.updateOne({password: hash});

            return res.status(200).json({msg: "success/password-changed"});
        } else {
            return res.status(400).json({msg: "success/user-not-found"});
        }
    } catch (e) {
        console.log(e);

        return res.status(500).json({msg: "err/internal-server-error"});
    }
}