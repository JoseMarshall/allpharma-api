const cloudinary = require('cloudinary').v2
const cloudinaryConfiguration = require('./credentials.json')
cloudinary.config(cloudinaryConfiguration)

module.exports = { cloudinary }