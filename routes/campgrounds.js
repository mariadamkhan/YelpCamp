const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require ('../utilities/catchAsync');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary');//dont need to specify index b/c Node automatically looks for an index in a folder
const upload = multer({storage}); // used to parse uploaded files
router.route('/')
    .get( catchAsync(campgrounds.index)) // *** GET INDEX ROUTE ***
    .post( isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); // *** POST NEW CAMPGROUND ***
        //adding in an "uplaod.single" and "image" is the field which multer should be looking for. The piece of the form data 
        //with the name of the image is a file and we want multer to do its thing on. That middleware should then add in the "file" attribute to req, as well as the rest of the body.
        //array expects multiple files to be added. Have options of single and array.
      

router.get('/new', isLoggedIn, campgrounds.renderNewForm); // *** GET NEW FORM ROUTE FOR A POST ***
//new route has to go before /:id route because if it comes after 'new' will be read as an id.

router.route('/:id')
    .get( catchAsync(campgrounds.showCampground)) //*** GET SHOW ROUTE ***
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground,catchAsync(campgrounds.updateCampground)) // *** PUT EDIT CAMPGROUND
    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //*** DELETE CAMPGROUND ***

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); // *** GET EDIT FORM ROUTE FOR A PUT REQUEST



module.exports = router;