const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    number:{
        type:Number,
        required:true,
    },
    gender:{
        type:String,
        required:true,
    },
    messages:[{
        type:String
        
    }]
});

module.exports = new mongoose.model("User",schema);