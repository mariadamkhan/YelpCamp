const CampGround = require('../models/campground');
const Review = require('../models/review');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken }) //this houses two methods we want forward and reverse geocoding.
module.exports.index = async ( req, res)=> {
    const campgrounds = await CampGround.find({})
    res.render("campgrounds/index", {campgrounds})
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res, next)=> {
    const geoData =  await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new CampGround(req.body.campground); //if we've made it past this point we know there is a user- thanks to isLoggedIn. we know there is a currentUser or a req.user thanks to passport. In our templates
    //we have access to our local variable currentUser we set up in app.js.
    campground.geometry= geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename})); // map over the array thats been added to req.files thanks to multer, and it includes a whole bunch of info
    //just take the path and the file name and make a new object for each one and put that in an array. So we end up with an array with images eah with these two properties. We add that on to campground and then we save and re-direct.
    campground.author = req.user._id //we take the user id and save it as an author on that newly created campground. When we make a new camground before we save we assign an author.
    await campground.save();
    console.log(campground)
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
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    console.log(campground)
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
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); //doing the same thing we did with createCampground, saving the array into a variable 
    campground.images.push(...imgs); //pushing the imgs unto the model, pushing because we dont want to override the existing images Using the spread operator b/c we dont want to have an array inside an array, will break things.
    await campground.save()
    if(req.body.deleteImages){ //if we have an array with deleted images
        for(let filename of req.body.deleteImages){ //looping over each obj in the array of deleteImages
          await cloudinary.uploader.destroy(filename); // cal cloudinary.uploader.destroy and it shuld delete that perticular file in cloudinary
        }
        await campground.updateOne({$pull:{images: {filename: {$in: req.body.deleteImages }}}}) // we are updating again, dont need to find it b/c we already did above
        // pull (thats how we pull elements out of the array) from the images array all images where the file name of that images is in the req.body.deleteImages array.
        console.log(campground) //updating after we delete from cloudinary.
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id)
    if (campground.reviews) {
        await Review.deleteMany({
          _id : { $in: campground.reviews }
        });
      }
      if (campground.images) {
        for (const img of campground.images) {
          await cloudinary.uploader.destroy(img.filename);
        }//deleting from cloudinary as well.
      }
    const deleted = await CampGround.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted a campground');
    res.redirect("/campgrounds")
};