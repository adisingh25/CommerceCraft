const connectWithDb = require("./config/database");              // database connection file

const app = require('./app')
const cloudinary = require('cloudinary')
require("dotenv").config()

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});






//connecting with db
connectWithDb();

app.listen(process.env.PORT, () => {
    console.log(`Server is running at PORT ${process.env.PORT}`)
})