const express = require('express');
const router = express.Router({mergeParams:true}); //routers get seperate params. But we can specify an option here  mergeParams:true. 
//now all the params from app.js will be merged with this file. And we will have access to the id from this path /campgrounds/:id/reviews. Not an issue for the campground
//id params because it is specified in that router. here we are referencing the campground param which is in a diff router, so that's why this issue is occuring

const catchAsync = require ('../utilities/catchAsync');
const CampGround = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

//*************** REVIEWS  ************ *//

// *** POST NEW REVIEW *****
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res,) => {//isLoggedIn protects the post re
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id; //whoever is logged in and is creating a new review (req.user) is the review author.
    campground.reviews.push(review);
    await review.save();
    await campground.save(); //saving campground as well because we are storing a reference to the review in the campground, an array called reviews.
    req.flash('success', 'Successfully made a new review');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// *** DELETE  REVIEW *****

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(async(req, res) => {
    //pull operator in mongo removes from an existing array all instanes
    //of a value or values that match a specific condition.
    const {id, reviewId} = req.params;
    await CampGround.findByIdAndUpdate(id, {$pull: {reviews:reviewId}}) //second thing we are doing is passing in an object, have the pull operator, and from the reviews array pull where we have reviewID.
    //we are saying take that reviewID and pull anything with that id out of reviews
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campgrounds/${id}`)
}));

module.exports = router;