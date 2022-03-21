const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require ('../utilities/catchAsync');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

router.route('/')
    .get( catchAsync(campgrounds.index)) // *** GET INDEX ROUTE ***
    .post( isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); // *** POST NEW CAMPGROUND ***

router.get('/new', isLoggedIn, campgrounds.renderNewForm); // *** GET NEW FORM ROUTE FOR A POST ***
//new route has to go before /:id route because if it comes after 'new' will be read as an id.

router.route('/:id')
    .get( catchAsync(campgrounds.showCampground)) //*** GET SHOW ROUTE ***
    .put( isLoggedIn, isAuthor, validateCampground,catchAsync(campgrounds.updateCampground)) // *** PUT EDIT CAMPGROUND
    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //*** DELETE CAMPGROUND ***

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); // *** GET EDIT FORM ROUTE FOR A PUT REQUEST



module.exports = router;