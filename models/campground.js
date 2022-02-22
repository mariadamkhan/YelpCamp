const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //shortcut, we will be referencing mongoose.Schema alot in the future.

// created the Schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews:[
        {
            type: Schema.Types.ObjectId,// it is an objectId from the review model
            ref: 'Review' //referencing out review model
        }
    ]
});

//in our route for deleting a review we are using .findByIdAndDelete, this function 
//triggers the middleware .findOneAndDelete
CampgroundSchema.post('findOneAndDelete', async function(doc){ //we have taken the doc that has just been deleted -- it is a post, 
    //not a pre because it has already been deleted, the campground in this case. we have access to the deleted doc because it has been passed in to the function
    //can clg the doc to see what has been deleted. So it has been deleted and has been passed in to our middleware function
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})


//compiled the model and exported it at the same time.
module.exports = mongoose.model('Campground', CampgroundSchema);