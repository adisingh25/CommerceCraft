const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')                     // used for generating random string as forgot password token

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please provide the name'],                 // [ values, error_messsage]
        maxlength : [40, 'Name should be under 40 characters'],
    },
    email : {
        type : String,
        required : [true, 'Please provide an email'],                
        validate : [validator.isEmail, 'Please provide a valid email'],
        unique : true
    },
    password : {
        type : String,
        required : [true, 'Please provide a password'],                
        minlength : [4, 'Password should be atleast of length 4'],
        select : false,                                                // ensures that when we get user from db we don't receive their password automatically unless asked. So, password isn't returned
    },
    role : {
        type : String,
        default : 'user'
    },
    photo : {
        id : {
            type: String,
            required : true
        },
        secure_url : {
            type: String,
            required : true
        },
    },
    forgotPasswordToken : {
        type : String,
    },
    forgotPasswordExpiry : {
        type : String,
    },
    createdAt : {
        type : Date,
        default : Date.now                               // this is auto-populate itself ( we don't need to fill values again and again)
    },
})

//encrypting password before saving 
//life-cycle event 'pre'
userSchema.pre('save', async function(next) {             //next is important

    if(!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});





//methods on the schema (user.methods)


//validating the passwords
userSchema.methods.isValidatedPassword = async function (usersendPassword) {
   return await bcrypt.compare(usersendPassword, this.password)
}




//creating and returning jwttokens 
userSchema.methods.getJwtToken = function() {
    return jwt.sign({id : this._id}, process.env.JWT_SECRET, {                 // '_id' gives the id value of that user from the db and we create token based on that
        expiresIn : process.env.JWT_EXPIRY
    })                             
}




//generate forgot password token {string here}
userSchema.methods.getforgotPasswordToken = function () {
    
    //generate a long and random string 
    const forgotToken = crypto.randomBytes(20).toString('hex');

    //getting a hash  - make sure to hash what we get from client at backend and then compare it with original one
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')



    this.forgotPasswordExpiry = Date.now() + 20*60*1000    // 20 mins

    return forgotToken
}





module.exports = mongoose.model('User', userSchema)