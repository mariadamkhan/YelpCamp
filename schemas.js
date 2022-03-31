const sanitizeHtml = require('sanitize-html');
const BaseJoi = require('joi');
//making a validation middleware


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers){
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension); //so we dont have to rename Joi in the code below. we are saying Joi is BaseJoi with the added extension.

module.exports.campgroundSchema  = Joi.object({
    campground: Joi.object({
        title:Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),// price is greater/equal to zero
        // image:Joi.string().required(),
        location:Joi.string().required().escapeHTML(),
        description:Joi.string().required().escapeHTML()
    }).required(),//we are validating the data with Joi, on creation. We have validation on the client and the server side.
     // this is not a mongoose schema, this will validated the data before even attempting to save it to mongoose.
    deleteImages:Joi.array()
})
 
module.exports.reviewSchema = Joi.object({
    review: Joi.object({ 
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})