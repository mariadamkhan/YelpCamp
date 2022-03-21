const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const users = require('../controllers/users');

router.route('/register')
    .get( users.renderRegister) // *** GET REGISTRATION FORM ***
    .post( catchAsync(users.register));  // *** CREATE NEW USER ***

router.route('/login')
    .get( users.renderLogin) // *** GET LOGIN FORM ***
    .post( passport.authenticate('local', {failureFlash:true, failureRedirect:'/login' } ), users.login);
    //we have helper method from passport called isAuthenticated and its authomatically added to the req object itself. Created a middleware for it in middleware.js
    //and used it on campground routes.

router.get('/logout', users.logout); // *** LOGOUT


module.exports = router;

