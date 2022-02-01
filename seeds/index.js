// file is self contained. Connected to mongoose, and will use the model.
// we will run this file on its own, seperate from the node app, anytime we need to seed out databse.
const mongoose = require("mongoose");
const CampGround = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp");
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
db.once("open", () => {
  console.log("Database Connnected");
});

// function to pick random indicy of an array:
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// fucntion that loops over 50 times and with the help of a random number b/w 1-1000 choses
// a city and its state as a location

const seedDB = async () => {
  await CampGround.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price= +(Math.random() * 80).toFixed(2)
    const camp = new CampGround({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`, //executing the sample function above to form a name
      // by choosing a random indicy of a descriptors array and
      // a places array and then interpelating to form one singular name
      image: "https://source.unsplash.com/collection/786923", //we will be getting a different image every time for the same campground
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Labore praesentium repudiandae perspiciatis, ea, officia reprehenderit optio, id laboriosam ratione culpa nihil voluptate quod enim sapiente minus quia error voluptas ipsum.",
        price
    });
    await camp.save();
  }
};

seedDB().then(() => {
  //accepts a then because its an async function.
  mongoose.connection.close(); //we close your database connection once we have populated our DB.
});
