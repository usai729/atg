const { User } = require("../Models/user.model");

const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors?.isEmpty()) {
        return res.json({msg: "err/invalid-request-parameters", errors});
    }

    const exists = await User.findOne({$or: [{username: username}, {email: email}]});

    if (exists) {
        return res.status(409).json({ message: "err/user-already-exists." });
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
        return res.status(409).json({ message: "err/user-does-not-exist" });
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