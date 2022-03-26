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

const opts = { toJSON: {virtuals: true}}; //this is in place for the campgroundSchema virtuals below. For the properties to be included in the campground object.
// created Campgrond Schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: { //have to follow this GeoJSON format
        type: {
            type: String,
            enum: ['Point'], //type must be Point, the only option
            required: true
        },
        coordinates: {
            type: [Number],
            required:true
        }
    },
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
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function (){ 
return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>` //this refers to each individual instance of a campground. Markup is dynamic 
}); //are creating this virtual for the cluster map popups. have to follow the mapbox setup. They have their datat
//comign from a properties object. we will now be able to access properties for our mapbox.

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