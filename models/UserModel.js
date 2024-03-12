const mongoose = require("mongoose");

const UserSchema =  mongoose.Schema({
    name : {type:String, required:true},// required : true ensures that this field is required
    email : {type:String, required : true, unique : true},
    password : {type:String, required:true}, 
    date : {type : Date, default : Date.now}
});


const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;