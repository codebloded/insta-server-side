const mongoose = require('mongoose');
const {ObjectId}  = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:"No image"
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    }
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;