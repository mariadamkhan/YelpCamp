// file is self contained. Connected to mongoose, and will use the model.
// we will run this file on its own, seperate from the node app, anytime we need to seed our databse.
const mongoose = require("mongoose");
const CampGround = require("../models/campground");
const cities = require("./cities");
const { descriptors, places, images } = require("./seedHelpers");

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
// a city and its state as a location.

const seedDB = async () => {
  await CampGround.deleteMany({}); //first clears the entire collection if you call this function and then proceeds to populate it with the help of the following lines of code.
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random30 = Math.floor(Math.random() * 30);
    const price = +(Math.random() * 80).toFixed(2)
    const randomImages = [];
    for (let i = 0; i < 1; i++) {
        randomImages.push({
            url: `${images[random30].url}`,
            filename: `${images[random30].filename}`
        });
    };
    const camp = new CampGround({
      author: '62311314a3b35f17ab74c5a0', //Mari <- username and password
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`, //executing the sample function above to form a name
      // by choosing a random indicy of a descriptors array and
      // a places array and then interpelating to form one singular name.
      // image: "https://source.unsplash.com/collection/786923", //we will be getting a different image every time for the same campground
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Labore praesentium repudiandae perspiciatis, ea, officia reprehenderit optio, id laboriosam ratione culpa nihil voluptate quod enim sapiente minus quia error voluptas ipsum.",
        price, //shortcut for saying price:price
        // images: [
        //   {
        //     url: 'https://res.cloudinary.com/du4fe9ocz/image/upload/v1647911550/YelpCamp/rhenbjccd3gvh4cnattk.jpg',
        //     filename: 'YelpCamp/rhenbjccd3gvh4cnattk'
        //   },
        //   {
        //     url: 'https://res.cloudinary.com/du4fe9ocz/image/upload/v1647911557/YelpCamp/enqjhwyg4xzraumtbbej.jpg',
        //     filename: 'YelpCamp/enqjhwyg4xzraumtbbej'
        //   },
        //   {
        //     url: 'https://res.cloudinary.com/du4fe9ocz/image/upload/v1647911568/YelpCamp/tivkqaovuy4eyqloni3h.jpg',
        //     filename: 'YelpCamp/tivkqaovuy4eyqloni3h',
        //   }
        // ]
        geometry: {
            type: 'Point', 
            coordinates: [-113.1331, 47.0202] 
          },
        images: [...randomImages]// spread because otherwise we'd have an array inside an array
    });
    await camp.save();
  }
};

seedDB().then(() => {
  //accepts a then because its an async function.
  mongoose.connection.close(); //we close our database connection once we have populated our DB.
});
