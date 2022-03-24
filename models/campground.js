const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //shortcut, we will be referencing mongoose.Schema alot in the future.

//creating a new image schema to create a virtual on images
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function (){ //images virtual to create smaller thumbnails for the edit thumbnails. Video 544.
    //this will refer to each individual file name. replace replaces only the first match of instance.
    return this.url.replace('upload', '/upload/w_200');
});

//**ALTERNATIVE SOLUTION WITHOUT CREATING AN IMAGESCHEMA- SUGGESTED BY ANOTHER STUDENT */
// CampgroundSchema.path('images').schema.virtual('thumbnail').get(function() {
//     return this.url.replace('/upload/', '/upload/w_200/');
// });

// created Campgrond Schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
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