
const Joi = require('joi');
//making a validation middleware
module.exports.campgroundSchema  = Joi.object({
    campground: Joi.object({
        title:Joi.string().required(),
        price: Joi.number().required().min(0),// price is greater/equal to zero
        // image:Joi.string().required(),
        location:Joi.string().required(),
        description:Joi.string().required()
    }).required(),//we are validating the data with Joi, on creation. We have validation on the client and the server side.
     // this is not a mongoose schema, this will validated the data before even attempting to save it to mongoose.
    deleteImages:Joi.array()
})
 
module.exports.reviewSchema = Joi.object({
    review: Joi.object({ 
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})