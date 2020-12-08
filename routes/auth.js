const express = require('express');
const { findOne } = require('../models/User');
const crypto = require('crypto');
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
        api_key:process.env.API_KEY,
        domain:process.env.DOMAIN,
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
                    from:process.env.EMAIL,
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
});

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
        }
        const token = buffer.toString('hex');
        User.findOne({email:req.body.email}).then(user=>{
            if(!user){
                return res.status(404).json({error:"User doesn't exists with this email"});
            }
            user.restToken = token;
            user.expireToken= Date.now() +3600000;
            user.save()
            .then(result=>{
                transporter.sendMail({
                    to:user.email,
                    from:process.env.EMAIL,
                    subject:'Rest Password',
                    html:`
                        <p>You requested for reset password</p>
                        <h4>click on this <a href:'http://localhost:3000/reset-password/${token}'>link to reset the password</h4> `
                });
                res.json({message:"Check Your email"}); 
            })
        })
    })

})


module.exports = router;