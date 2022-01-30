const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const CampGround = require('./models/campground')

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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


app.get('/', (req, res)=> {
    res.render("home")
})

app.get('/makecampground', async(req, res)=> {
    const camp = new CampGround({
        title: 'My Backyards'
    });
    await camp.save();
    res.send(camp)
})

app.listen(3000, ()=> {
    console.log("LISTENING ON PORT 3000")
})