const Review = require('../models/review');
const CampGround = require('../models/campground');

module.exports.createReview = async (req, res,) => {//isLoggedIn protects the post re
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id; //whoever is logged in and is creating a new review (req.user) is the review author.
    campground.reviews.push(review);
    await review.save();
    await campground.save(); //saving campground as well because we are storing a reference to the review in the campground, an array called reviews.
    req.flash('success', 'Successfully made a new review');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async(req, res) => {
    //pull operator in mongo removes from an existing array all instanes
    //of a value or values that match a specific condition.
    const {id, reviewId} = req.params;
    await CampGround.findByIdAndUpdate(id, {$pull: {reviews:reviewId}}) //second thing we are doing is passing in an object, have the pull operator, and from the reviews array pull where we have reviewID.
    //we are saying take that reviewID and pull anything with that id out of reviews
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campgrounds/${id}`)
};