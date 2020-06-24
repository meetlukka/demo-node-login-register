const mongoose = require("mongoose")

mongoose.connect('mongodb://localhost:27017/userdb', { useNerUrlParser:true }, (err)=> {
    if(!err) {
        console.log("MongoDB Connection Successful");
    }
    else{
        console.log("Error in database connection"+err);
    }
})