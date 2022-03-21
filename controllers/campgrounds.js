const CampGround = require('../models/campground');

module.exports.index = async ( req, res)=> {
    const campgrounds = await CampGround.find({})
    res.render("campgrounds/index", {campgrounds})
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res, next)=> {
    const campground = new CampGround(req.body.campground); //if we've made it past this point we know there is a user- thanks to isLoggedIn. we know there is a currentUser or a req.user thanks to passport. In our templates
    //we have access to our local variable currentUser we set up in app.js.
    campground.author = req.user._id //we take the user id and save it as an author on that newly created campground. When we make a new camground before we save we assign an author.
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
};
module.exports.showCampground = async (req, res) => {
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
};

module.exports.renderEditForm = async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/edit", {campground})
};

module.exports.updateCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground}); //using the spread operator to spread the origional object into this object. Beause everything is housed under 'campground'.
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const deleted = await CampGround.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted a campground');
    res.redirect("/campgrounds")
};