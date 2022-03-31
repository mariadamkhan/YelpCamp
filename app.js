if(process.env.NODE_ENV !== "production"){ //if we are running in development mode require dotenv which will take the variables in the file and add them to process.env in node app. In production we dont do this.
    require('dotenv').config(); //have access to our .env cause of this line. Running in development by default.
};

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize'); //security package mongo injection
const helmet = require('helmet');



const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

mongoose
  .connect('mongodb://localhost:27017/yelp-camp')
// *****COULD HAVE USED THIS LOGIC BELOW TO CHECK FOR A CONNECTION ERROR,
// ******BUT USED THE ON/ONCE THIS TIME. CAN READ MORE ON IT IN MONGOOSE DOCS
//   .then(() => {
//     console.log("MONGO CONNECTION OPEN");
//   })
//   .catch((err) => {
//     console.log("OH NO MONGO CONNECTION, ERROR,", err);
//   });

const db = mongoose.connection; //set this to a variable do we dont have to reference db.on, db.once in the future.
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=> {
    console.log("Database Connnected")
});

// ****EXPLANATION FOR THE ABOVE - LOGIC TO CHECK IF THERE IS A CONNECTION ERROR
// ** On **
// In this case, if there is an error, the on callback would run which would result 
// into printing the error in console

// ** Once **
// It is the callback to be executed when the given event is generated. 
// In our case, the function will be called when the connection to mongodb is open 
// i.e. the connection is successful.

//** SETTING UP EJS AND AN ABSOLUTE PATH */ 
app.engine('ejs', ejsMate); //one of many engines used to parse and make sense of ejs. We are saying use this instead of the default.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ** MIDDLEWARE **
//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize()); //mongo injection -- security

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie: {
        name: 'session',
        httpOnly: true, //extra security
        // secure: true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, //saying expire in a week
        maxAge: 1000 * 60 * 60 * 24 * 7, //dont have to set up an expiration, otherwise someone could stay logged in forever.
    }
};

app.use(session(sessionConfig));
app.use(flash());

//** HELMET SECURITY*/
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/du4fe9ocz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//** PASSPORT INITIALIZATION AND AUTHENTICATION */
app.use(passport.initialize());
app.use(passport.session()); //look at docs for info  on this. Must use this if we want persistant loggin sessions. Alternative is having to loggin on every single request.
//passport.session has to come after app.use(session)
passport.use(new LocalStrategy(User.authenticate()));// we are saying passport, use the Local Startegy downloaded and required, and for it the authentication method is goign to be located on our user model. It is coming form the passport-local-monggose. Methods that are added automatically.

// *** STORE A USER WITH PASSPORT ** //
passport.serializeUser(User.serializeUser()); //tells passport how to serialize a user, serialization is basically how do we store a user in a session.
passport.deserializeUser(User.deserializeUser()); //how do we get a user out of that session. Methods added thanks to plugin LocalStrategy.

//** FLASH MIDDLEWARE */
//we have access to these on every single template
app.use((req, res, next)=> {
    res.locals.currentUser = req.user; //now all templates will have accesss to currentUser
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})// on every single request we're going to take whatever is in the flash under success and have access to it under our locals under the key success
//this way we dont have to pass this to the redirected page.


app.get('/fakeuser', async (req,res)=> {
    const user = new User({email: 'colt@gmail.com', username: 'colttttt' }) //dont pass in the passport b/c we will be suing the register method.
    const newUser = await User.register(user, 'chicken');//available thanks to the passport-local-monngoose. we pass in a newly created user object and the password, and has that password
    res.send(newUser);
})
//does not use bcrypt

//** ROUTES */
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get("/", (req, res)=> {
    res.render('campgrounds/home')
})

//** 404 PAGE */
app.all('*', (req, res, next)=> { //for every request, star for every path, call this callback.
    next(new ExpressError('Page Not Found', 404)) //this will only run if nothing else has matched first. Order is important.
} ) 

//** ERROR HANDLING */
app.use((err, req, res, next)=> {
    const {statusCode= 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=> {
    console.log("LISTENING ON PORT 3000")
})