const mongoose = require('mongoose');
const Schema = mongoose.Schema; //shortcut, we will be referencing mongoose.Schema alot in the future.

// created the Schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String

});
//compiled the model and exported it at the same time.
module.exports = mongoose.model('Campground', CampgroundSchema)