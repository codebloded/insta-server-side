  
const mongoose = require('mongoose');



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
    }

    
})

const User = mongoose.model('User', userSchema);
module.exports = User;