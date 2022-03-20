const express = require('express');
const router = express.Router();
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const catchAsync = require ('../utilities/catchAsync');
const CampGround = require('../models/campground');

// *** GET INDEX ROUTE ***
router.get('/', catchAsync(async ( req, res)=> {
    const campgrounds = await CampGround.find({})
    res.render("campgrounds/index", {campgrounds})
}));

// *** GET NEW FORM ROUTE FOR A POST ***
router.get('/new', isLoggedIn,(req, res) => {
    res.render('campgrounds/new')
})

// *** POST NEW CAMPGROUND ***
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next)=> {
        const campground = new CampGround(req.body.campground); //if we've made it past this point we know there is a user- thanks to isLoggedIn. we know there is a currentUser or a req.user thanks to passport. In our templates
        //we have access to our local variable currentUser we set up in app.js.
        campground.author = req.user._id //we take the user id and save it as an author on that newly created campground. When we make a new camground before we save we assign an author.
        await campground.save();
        req.flash('success', 'Successfully made a new campground');
        res.redirect(`/campgrounds/${campground._id}`)
}) )

//*** GET SHOW ROUTE ***
router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id).populate({
        path: 'reviews', //populating the reviews
        populate:{
            path: 'author' //populating the author of each review
        }
    }).populate('author');//populating the author of the campground
    console.log(campground)
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}))

// *** GET EDIT FORM ROUTE FOR A PUT REQUEST
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/edit", {campground})
}))

// *** PUT EDIT CAMPGROUND
router.put('/:id', isLoggedIn, isAuthor, validateCampground,catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground}); //using the spread operator to spread the origional object into this object. Beause everything is housed under 'campground'.
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const deleted = await CampGround.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted a campground');
    res.redirect("/campgrounds")
}))

module.exports = router;