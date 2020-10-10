const express = require('express');
const { findOne } = require('../models/User');
const User = require("../models/User");
const bcrypt = require('bcryptjs');
require('dotenv').config()
const JWT = require('jsonwebtoken');
const authLogin = require('../middleware/authLogin');

const router = express.Router();

router.get('/protected',authLogin, (req,res)=>{
    res.send("Hello world welcome to instagram");
})

// ================SIGNIN ROUTE==========================
router.post("/signup", async (req, res)=>{
    req.header("Content-Type", "application/json");
    const{name, email,password} = req.body;
    if(!name || !email || !password){
        return res.status(404).json({error:"please fill all the fields"});
    }
    try {
        const savedUser = await User.findOne({email:email});
        if(savedUser){
            return res.json({message:"user already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user =new User({
            name,
            email,
            password:hashedPassword
        })
         user.save()
         .then(user=>{
            res.json({message:"saved sucessfuly!"})
        }).catch(err=>{
            res.json({message:err})
        })
                   
     
    } catch (err) {
        res.json({error:err});
    }

});


// ================LOGIN ROUTE======================
router.post("/login", async (req,res)=>{
    req.header("Content-Type","application/json");
    const {email, password} = req.body;
    if(!email || !password){
        return res.json({message:"please provide email or password"});
    }
    try {
        const savedUser = await User.findOne({email:email});
        if(!savedUser){
           return res.status(422).json({err:"Inavlid email or password"})
        }
  

            const matchedPassword = await bcrypt.compare(password, savedUser.password);
            if(matchedPassword){
                //  res.json({message:"sucessfuly LoggedIn"});
                //Token
                const token = JWT.sign({_id:savedUser._id}, process.env.JWT_SECRET);
                res.json({token});
            }
            else{
                res.json({error:"Email or Passowrd is wrong"});
            }
       
    } catch (error) {
        res.json({message:error});
    }
 

})

  
module.exports = router;