const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema } = require('./schemas.js'); //destructuring because we plan on having multiple schemas.
const catchAsync = require ('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require("method-override");
const CampGround = require('./models/campground');


mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
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
app.engine('ejs', ejsMate ) //one of many enhines used to parse and make sense of ejs. We are sayong use this instead of the default.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// ** MIDDLEWARE **
//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride("_method")); 

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

app.get("/", (req, res)=> {
    res.render('campgrounds/home')
})

// *** GET INDEX ROUTE ***
app.get("/campgrounds", catchAsync(async ( req, res)=> {
    const campgrounds = await CampGround.find({})
    res.render("campgrounds/index", {campgrounds})
}));

// *** GET NEW FORM ROUTE FOR A POST ***
app.get("/campgrounds/new", (req, res)=> {
    res.render('campgrounds/new')
})



// *** POST NEW CAMPGROUND ***
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next)=> {
        const campground = new CampGround(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
    
}) )

//*** GET SHOW ROUTE ***
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    res.render('campgrounds/show', {campground});
}))

// *** GET EDIT FORM ROUTE FOR A PUT REQUEST
app.get("/campgrounds/:id/edit", catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findById(id);
    res.render("campgrounds/edit", {campground})
}))

// *** PUT EDIT CAMPGROUND
app.put("/campgrounds/:id", validateCampground,catchAsync(async(req, res) => {
    const {id} = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const deleted = await CampGround.findByIdAndDelete(req.params.id)
    res.redirect("/campgrounds")

}))

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