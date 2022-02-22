const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
    body:String,
    rating:Number
});
//this is a one to many relationship, have to connect our review to a campground
//we are going to embed an array of object ids in each campground
//reason for that is that we can have thousands and of reviews for the more popular
//campgrounds. instead of directing embedding them in a single campground we are going to break them
//out into their own model and store the object ids in a campground. that means we are going to have to rework our campground schema


module.exports = mongoose.model('Review', reviewSchema);