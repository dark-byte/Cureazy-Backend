
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const options = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto"
}

const uploadProfilePic = (image)=>{
    return new Promise((resolve, reject)=>{
        cloudinary.uploader.upload(image, options, (err, result)=>{
            if (result && result.secure_url){
                console.log("Image uploaded to ", result.secure_url)
                return resolve(result.secure_url)
            }
            console.error(err.message);
            return reject({message: error.message})
        })
    })
}

module.exports = {uploadProfilePic}