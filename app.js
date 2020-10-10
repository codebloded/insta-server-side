const express = require("express");
const mongoose = require("mongoose");


const auth = require("./routes/auth");
const Post = require('./models/Post');
const post = require('./routes/post')

const app = express();
const hostName = "localhost"
const port ="4000";
app.use(express.json())

// ====================MONGODB CONNECTION================

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOURI, ({useUnifiedTopology:true, useNewUrlParser:true}), ()=>{
    console.log("connect to MongoDB");
});

app.use(auth);
app.use(post);



// ==============LISTENING THE SEVER==================
app.listen(port, ()=>{
    console.log(`Server is up and running at http://${hostName}:${port}`);
})