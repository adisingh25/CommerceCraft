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


//cookie and file middleware 
app.use(cookieParser());
app.use(fileUpload());







//morgan middleware ( has to be before we use the routes )
app.use(morgan("tiny"))                                  // gives the api-requests we are making in the terminal



//routes
const home = require('./routes/home')



//router middleware 
app.use("/api/v1", home)




//export app js
module.exports = app