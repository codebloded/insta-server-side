const { Router } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const router = express.Router();
const authLogin = require('../middleware/authLogin');

router.post("/createpost",authLogin, async (req, res)=>{
    req.header('Content-Type', 'application/json');
    const {title, body} = req.body;
    if(!title || !body){
        return res.status(422).json({message:"Please add all feilds"});
    }
        req.user.password = undefined;
        const post = new Post({
        title,
        body,
        postedBy:req.user
    })
    try{

        const savedPost = await post.save();
        res.json({post:savedPost});
    }catch(err){
        res.json({error:err});
    }
})




module.exports = router;