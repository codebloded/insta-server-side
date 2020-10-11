const JWT = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        console.log("12")
        return res.json({ message: "You must be LoggedIn" });
    }
    const token = authorization.replace("Bearer ", "");
    JWT.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {

            return res.json({ message: "You must be logged in" });
        }

        const { _id } = payload;
        const userData = await User.findById(_id);
        req.user = userData;
        next()
    });



}