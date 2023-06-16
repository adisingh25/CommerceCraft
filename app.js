require("dotenv").config()                    // just for safety reasons it is being uploaded here

const express = require('express')
const app = express()
const morgan = require('morgan')                // a logger
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')





//for swagger documentation 
//swagger docs - information 
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));





//regular middleware 
app.use(express.json())
app.use(express.urlencoded({ extended : true }))




//setting up our template engine, for rendering 'ejs' files
app.set('view engine', 'ejs');


//cookie and file middleware 
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
}));







//morgan middleware ( has to be before we use the routes )
app.use(morgan("tiny"))                                  // gives the api-requests we are making in the terminal



//routes
const home = require('./routes/home')
const user = require('./routes/user')
const product = require('./routes/product')
const payment = require("./routes/payment");
const order = require("./routes/order");


//router middleware 
app.use("/api/v1", home)
app.use("/api/v1", user)
app.use("/api/v1", product)
app.use("/api/v1", payment);
app.use("/api/v1", order);





//for using our ejs file to test file upload 
app.get("/signuptest", (req, res) => {
    res.render("signuptest");
});

//export app js
module.exports = app