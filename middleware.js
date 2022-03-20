const {campgroundSchema, reviewSchema} = require('./schemas.js'); //destructuring because we plan on having multiple schemas.
const ExpressError = require('./utilities/ExpressError');
const CampGround = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //checks if the user is authenticated before allowing them to get to the create new campground page.
    req.session.returnTo = req.originalUrl
    req.flash("error", "You must be logged in first");
    return res.redirect("/login");
  }
  next(); //otherwise call next and move on, good to go
};

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); //destructuring and pulling out the error. This is saying if there is an error, we are going to map over the error.details to make a single string message and pass it into the throw new error.
  if(error){
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400) //results.error.details is an array, we need to make it into a string becase we are using it as a message, so we need to map over it. End of video 446.
  }else{
      next(); //needs to call next to consider the second callback catchAsync. If it doesnt call next and instead sends something
      //back then that callback catcAsync in our app.post & put here will never run.
  }
};

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params; //take the id from the url
    const campground = await CampGround.findById(id); //look up the campground with that id
    if(!campground.author.equals(req.user._id)){ //checking if the logged in user's req._id matches the author of the campground to access editing.
        req.flash('error', 'You do not have permission to do that!') //if it's not the author flash the message 
        return res.redirect(`/campgrounds/${id}`) //returning to make sure this code works and the bottom portion after this code does not run.
    }else {
        next(); //if it is the author move on to the rst of the functionality.
    }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params; //take the campground id from the url
  const review = await Review.findById(reviewId); //look up the review with that id
  if(!review.author.equals(req.user._id)){ //checking if the logged in user's req._id matches the author of the campground to access editing.
      req.flash('error', 'You do not have permission to do that!') //if it's not the author flash the message 
      return res.redirect(`/campgrounds/${id}`) //returning to make sure this code works and the bottom portion after this code does not run.
  }else {
      next(); //if it is the author move on to the rst of the functionality.
  }
};

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);  
  if(error){
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400) 
  }else{
      next(); 
  }
};

//how can we get access to the id of the user, there is somehting on the req called user. req.user.It will contain info 
//on the user. It is sotred in the session but we dont have to deal with that.