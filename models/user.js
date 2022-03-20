const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true //not a validation 
    }
});

UserSchema.plugin(passportLocalMongoose); //this is going to add on a field for username and password to our schema.
//it is going to make sure they are unique and not duplicated, give us some additional methods we can use.
//it is hidden, but it is there.

module.exports = mongoose.model('User', UserSchema);