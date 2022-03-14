const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require("method-override");

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


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
// setting up ejs and an absolute path 
app.engine('ejs', ejsMate ) //one of many engines used to parse and make sense of ejs. We are saying use this instead of the default.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// ** MIDDLEWARE **
//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride("_method")); 

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get("/", (req, res)=> {
    res.render('campgrounds/home')
})
app.all('*', (req, res, next)=> { //for every request, star for every path, call this callback.
    next(new ExpressError('Page Not Found', 404)) //this will only run if nothing else has matched first. Order is important.
} ) 

app.use((err, req, res, next)=> {
    const {statusCode= 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=> {
    console.log("LISTENING ON PORT 3000")
})