const { Router } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const router = express.Router();
const authLogin = require('../middleware/authLogin');
const { json } = require('body-parser');
const User = require('../models/User');


router.get("/user/:id",authLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
    .select('-password').then(user=>{
        Post.find({postedBy:req.params.id}).populate("postedBy","_id name")
        .exec((err,posts)=>{
            if(err){
               return res.status(422).json({error:err});
            }
            res.json({user,posts});
        })
    }).catch(err=>{
        return res.status(404).json({error:'user not found '});
    })
});

router.put('/follow', authLogin, (req, res)=>{
    User.findByIdAndUpdate(req.body.followId, {
        $push:{followers:req.user._id},
       
        }, {new:true},
        (err, result)=>{
        if(err){
            res.status(422),json({error:err});
        }
        User.findByIdAndUpdate(req.user._id, {
            $push:{following:req.body.followId}

        }, {new:true}).select('-password').then(result=>{
            res.json(result);
        }).catch(err=>{
            return res.status(422).json({error:err});
        })
});

router.put('/unfollow', authLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{new:true}, (err, result)=>{
        if(err){
            res.status(422).json({error:err});
        }
        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.unfollowId}
        },{new:true}).select('-password').then(result=>{
            res.json(result);
        }).catch(err=>{
            res.status(422).json({error:err});
        })
    })

})
});





module.exports = router;