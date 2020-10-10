const express = require('express');
const { findOne } = require('../models/User');
const User = require("../models/User");
const bcrypt = require('bcryptjs');
require('dotenv').config()

const router = express.Router();

router.get('/', (req,res)=>{
    res.json({"message":"Hello world welcome to instagram"});
})

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

  
module.exports = router;