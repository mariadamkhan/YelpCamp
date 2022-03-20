const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');

router.get('/register', (req, res)=> {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req, res, next)=> {
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username}) //dont pass in the passport b/c we will be suing the register method.
    const registeredUser = await User.register(user, password);//available thanks to the passport-local-monngoose. we pass in a newly created user object and the password, and has that password
    req.login(registeredUser, (err)=> { //including this because without after registering the user still has to log in, and we want to log the user in. There is a password helper method for that req.login
        // it establishes a loggin session. Primarily used when users sign up. After registering a user. This fucntion requires a callback, cant await it, has an error perameter.
        if (err) return next(err);
        req.flash('success', 'Welcome to YelpCamp');
        res.redirect('/campgrounds');
    })
} catch(e){
    req.flash('error', e.message);
    res.redirect('/register')
}
}));//not logged in, just created a new user, not keeping track of who's logged in.
//catchAsync deals with any errors and pass them on to next wich will hit our error handler.
//adding our own try & catch. There is alreayd a try ctahc around this whole function, adding another one and handling it in a diff way.

router.get('/login', (req,res)=> {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:'/login' } ), (req,res)=> {
    //passport gives us a middleware called passport.authenticate. It will expect us to specify a strategy- in our case local.
    //allows us to pass in options in an object.
    req.flash('success', "Welcome Back!");
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo; //we dont want the url to sit in the session, after it did what it was supposed to, we can get rid of it.
    res.redirect(redirectUrl);
});
//we have helper method from passport called isAuthenticated ad ist authomatically added to the req object itself. Created a middleware for it in middleware.js
//and used it on campground routes.

router.get('/logout', (req, res)=> {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');

})


module.exports = router;

