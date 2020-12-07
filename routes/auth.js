const express = require('express');
const { findOne } = require('../models/User');
const User = require("../models/User");
const bcrypt = require('bcryptjs');
require('dotenv').config()
const JWT = require('jsonwebtoken');
const authLogin = require('../middleware/authLogin');
const nodemailer = require('nodemailer');
const router = express.Router();
const mailGun = require('nodemailer-mailgun-transport');

const auth = {
    auth:{
        api_key:'bce7b3a79842dbf1b2becae5f11a637a-4879ff27-4a817ef7',
        domain:'sandbox60a2bb74e9e245949c8191120f8343e5.mailgun.org',
    }
}
const transporter = nodemailer.createTransport(mailGun(auth));



router.get('/protected', authLogin, (req, res) => {
    res.send("Hello world welcome to instagram");
})


// ================SIGNIN ROUTE==========================
router.post("/signup", async (req, res) => {
    req.header("Content-Type", "application/json");
    const { name, email, password,pic } = req.body;
    if (!name || !email || !password) {
        return res.status(404).json({ error: "please fill all the fields" });
    }
    try {
        const savedUser = await User.findOne({ email: email });
        if (savedUser) {
            return res.json({ message: "user already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            pic
        })
        user.save()
            .then(user => {

                transporter.sendMail({
                    to:user.email,
                    from:'Mailgun Sandbox <postmaster@sandbox60a2bb74e9e245949c8191120f8343e5.mailgun.org>',
                    subject:'signup sucessfuly',
                    html:"<h1>Welcome to Instagram </h1>"
                })
                res.json({ message: "saved sucessfuly!" })
            }).catch(err => {
                res.json({ message: err })
            })


    } catch (err) {
        res.json({ error: err });
    }

});


// ================LOGIN ROUTE======================
router.post("/login", async (req, res) => {
    req.header("Content-Type", "application/json");
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ error: "please provide email or password" });
    }
    try {
        const savedUser = await User.findOne({ email: email });
        if (!savedUser) {
            return res.status(422).json({ error: "Inavlid email or password" })
        }


        const matchedPassword = await bcrypt.compare(password, savedUser.password);
        if (matchedPassword) {
           
            //Token
            const token = JWT.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
            const {_id, name, email, followers, following, pic} = savedUser;
            res.json({ token ,user:{_id,name,email, followers, following,pic}});
        }
        else {
            res.json({ error: "Email or Passowrd is wrong" });
        }

    } catch (err) {
        res.json({ err: error });
    }
})


module.exports = router;