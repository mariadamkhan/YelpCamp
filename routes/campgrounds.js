const express = require('express');
const router = express.Router();

const catchAsync = require ('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');

const CampGround = require('../models/campground');
const {campgroundSchema} = require('../schemas.js'); //destructuring because we plan on having multiple schemas.

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); //destructuring and pulling out the error. This is saying if there is an error, we are going to map over the error.details to make a single string message and pass it into the throw new error.
  if(error){
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400) //results.error.details is an array, we need to make it into a string becase we are using it as a message, so we need to map over it. End of video 446.
  }else{
      next(); //needs to call next to consider the second callback catchAsync. If it doesnt call next and instead sends something
      //back then that callback catcAsync in our app.post & put here will never run.
  }
}

// *** GET INDEX ROUTE ***
router.get('/', catchAsync(async ( req, res)=> {
    const campgrounds = await CampGround.find({})
    res.render("campgrounds/index", {campgrounds})
}));

// *** GET NEW FORM ROUTE FOR A POST ***
router.get('/new', (req, res)=> {
    res.render('campgrounds/new')
})

// *** POST NEW CAMPGROUND ***
router.post('/', validateCampground, catchAsync(async (req, res, next)=> {
        const campground = new CampGround(req.body.campground);
        await campground.save();
        req.flash('success', 'Successfully made a new campground');
        res.redirect(`/campgrounds/${campground._id}`)
}) )

//*** GET SHOW ROUTE ***
router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}))

// *** GET EDIT FORM ROUTE FOR A PUT REQUEST
router.get('/:id/edit', catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/edit", {campground})
}))

// *** PUT EDIT CAMPGROUND
router.put('/:id', validateCampground,catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground}); //using the spread operator to spread the origional object into this object. Beause everything is housed under 'campground'.
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const deleted = await CampGround.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted a campground');
    res.redirect("/campgrounds")
}))

module.exports = router;