  
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;



const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        max:30,
        required:true,
    },
    password:{
        type:String,
        min:8,
        required:true
    },
    resetToken:String,
    expireToken:Date,
    pic:{
        type:String,
        default:'https://res.cloudinary.com/icoderohan/image/upload/v1607357793/noimage_z5iokz.png'
    },
    followers:[{type:ObjectId, ref:"User"}],
    following:[{type:ObjectId, ref:"User"}]

    
})

const User = mongoose.model('User', userSchema);
module.exports = User;