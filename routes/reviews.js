const express = require('express');
const router = express.Router({mergeParams:true}); //routers get seperate params. But we can specify an option here  mergeParams:true. 
//now all the params from app.js will be merged with this file. And we will have access to the id from this path /campgrounds/:id/reviews. Not an issue for the campground
//id params because it is specified in that router. here we are referencing the campground param which is in a diff router, so that's why this issue is occuring
const reviews = require('../controllers/reviews');
const catchAsync = require ('../utilities/catchAsync');
const CampGround = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

//*************** REVIEWS  ************ *//

// *** POST NEW REVIEW *****
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// *** DELETE  REVIEW *****

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router;