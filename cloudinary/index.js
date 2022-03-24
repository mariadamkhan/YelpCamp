const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ //associating our cloudinary account with this cloudinary instance.
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({ //setting up an instance of cloudinary storage in this file.
     cloudinary,//passing in the cloudinary object we have just configured
     params: {
         folder: 'YelpCamp', //specifying folder, folder in cloduinary which we should store things in,
         allowedFormats: [ 'jpeg', 'png', 'jpg'], 
     }
});

module.exports = {
    cloudinary,
    storage
};

//cloudinary storage is now configured that is has credentials for our particular cloudinary account 
//and we want to upload things to yelpcamp with specified formats.