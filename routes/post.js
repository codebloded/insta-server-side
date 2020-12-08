const { Router } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const router = express.Router();
const authLogin = require('../middleware/authLogin');
const { json } = require('body-parser');
const User = require('../models/User');


router.get('/allpost',authLogin, async (req, res) => {
    try {
        const posts = await Post.find()
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort('-createdAt')
        res.json({ posts: posts });
    } catch (error) {
        res.json({ err: error });
    }
})

router.get('/getsubpost',authLogin, async (req, res) => {
    try {
        const posts = await Post.find({postedBy:{$in: req.user.following}})
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort('-createdAt')
        res.json({ posts: posts });
    } catch (error) {
        res.json({ err: error });
    }
})

router.get('/mypost', authLogin, async (req, res) => {
    try {
        const myPosts = await Post.find({ postedBy: req.user._id }).populate('postedBy', "_id name");
        res.json({ myPosts });
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
});

router.post("/createpost", authLogin, async (req, res) => {
    req.header('Content-Type', 'application/json');
    const { title, body, photo } = req.body;
    if (!title || !body || !photo) {
        return res.status(422).json({ error: "Please add all feilds" });
    }
    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo:photo,
        postedBy: req.user
    })
    try {

        const savedPost = await post.save();
        res.json({ post: savedPost });
    } catch (err) {
        res.json({ error: err });
    }
})

router.put('/like',authLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id},
    },{new:true}).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result);
        }
    })
})

router.put('/unlike',authLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id},
    },{new:true}).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result);
        }
    })
});

router.put('/comment',authLogin,(req,res)=>{
        const comment = {
            text:req.body.text,
            postedBy:req.user._id
        }
        Post.findByIdAndUpdate(req.body.postId,{
            $push:{comments:comment}
        },{new:true}).populate("comments.postedBy", "id name")
        .exec((err,result)=>{
            if(err){
                res.status(404).json({error:err});
            }else{
                res.json(result); 
            }
        })
    });

router.delete("/deletepost/:postId",authLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId}).populate('postedBy',"_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(404).json({error:err});
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove().then(result=>{
                res.json(result)
            }).catch(err=>{
                res,json({error:err});
            })
        }
    })
});

router.delete("/deletecomment/:_id",authLogin, (req,res)=>{
    Post.findOne({_id:req.params._id}).populate("postedBy","_id name")
    .exec((err,comment)=>{
        if(err || !comment){
            return res.status(404).json({error:err});
        }
        if(comment.postedBy._id.toString() === req.user._id.toString()){
            comment.remove().then(result=>{
                res.json(result);
            })
        }
    }).catch(err=>{
        res.json({error:err});
    })

})



module.exports = router;