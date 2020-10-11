const { Router } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const router = express.Router();
const authLogin = require('../middleware/authLogin');
const { json } = require('body-parser');


router.get('/allpost', async (req, res) => {
    try {
        const posts = await Post.find().populate("postedBy", "_id name");
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
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(422).json({ message: "Please add all feilds" });
    }
    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        postedBy: req.user
    })
    try {

        const savedPost = await post.save();
        res.json({ post: savedPost });
    } catch (err) {
        res.json({ error: err });
    }
})




module.exports = router;