const User = require('../models/user')               // getting our user model
const BigPromise = require('../middlewares/bigPromise');            // use this or instead use try-catch block 
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto')   


exports.signup= BigPromise(async (req,res, next) => {             //next is just incase we add something later on
    
   
    if (!req.files) {
        return next(new CustomError("photo is required for signup", 400));
    }

    const {name, email, password, } = req.body;


    if(!email || !name || !password) {
        return next(new CustomError('All fields are mandatory', 400));
    }


    
    
    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder : "users",
        width : "150",
        crop : "scale"
    })
    

    //saving the user in the db
    const user = await User.create({
        name,
        email,
        password,
        photo : {
            id : result.public_id,
            secure_url : result.secure_url
        },
    })

    cookieToken(user,res);

})

exports.login = BigPromise(async(req,res, next) => {
    const { email, password } = req.body

    if(!email || !password) {
        return next(new CustomError('Fields are mandatory', 400))
    }

    const user = await User.findOne({email}).select("+password")         // in model we have written 'select : false' hence to extract password we will have to explicity specify it 

    if(!user) {
        return next(new CustomError('You are not registered with us.', 400))
    }

    const isPasswordCorrect = await user.isValidatedPassword(password);

    if(!isPasswordCorrect) {
        return next(new CustomError('Password incorrect', 400))
    } 

    //all successful checks, we send the info and the token
    cookieToken(user, res);
})

exports.logout = BigPromise(async(req,res,next) => {
    //clearing the cookies we have

    res.cookie('token', null, {
        expires : new Date(Date.now()),
        httpOnly : true
    })

    res.status(200).json({
        success: true,
        message : 'LOGOUT successful'
    })
})

exports.forgotPassword = BigPromise(async(req,res, next) => {

    const {email} = req.body;

    const user = await User.findOne({email})

    if(!user) {
        return next(new CustomError('Email not found as registered', 400))
    }

    const forgotToken = user.getforgotPasswordToken()

    await user.save({validateBeforeSave : false})                  // just saves without validating (saves the token and the expiry)

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`


    const message = `Copy paste this link in a new webpage and hit Enter \n \n ${myUrl}`;

    try {
        await mailHelper({
            email : user.email,
            subject : 'Forget Password - Reset Password',
            message
        })

        res.status(200).send({
            success : true,
            message : 'Mail was send successfully'
        })
        
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({validateBeforeSave : false}) 

        return next(new CustomError(error.message, 500))
    }


})

exports.passwordReset = BigPromise(async(req,res,next) => {

    const token = req.params.token                         // the token that we had send earlier was encrpted using 'crypto' library using SHA-256 , 
                                                           // now we encrypt the token received from the user using the same method and then compare both of them
    const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')
    

    const user = await User.findOne({                                    // both the conditions has to be 'true'
        forgotPasswordToken : encryptedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
          return next(new CustomError("Token is invalid or expired", 400));
    }

    

    if(req.body.password!==req.body.confirmPassword) {
        return next(new CustomError('The 2 passwords did not match', 400));
    }

   
    user.password = req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save()

    cookieToken(user, res);

})


//only possible when user is logged in - as the cookie stores token there which is used by middleware to verify the person

exports.getLoggedInUserDetails = BigPromise(async(req,res,next) => {

    const user = await User.findById(req.user.id)

    res.status(200).send({
        success : true,
        user
    })
    

})


exports.changePassword = BigPromise(async(req,res,next) => {

    const userId = req.user.id;

    const user = await User.findById(userId).select("+password")

    const isCorrectOldPassword  = await user.isValidatedPassword(req.body.oldPassword);

    if(!isCorrectOldPassword) {
        return next(new CustomError('Your password does not match', 400))
    }

    user.password = req.body.newPassword;
    await user.save()

    cookieToken(user, res)               // we will update the token and send the response as per requirement
    

})


exports.upadateDashboard = BigPromise(async(req,res,next) => {

    const userId = req.user.id;
   

    const newData = {
        name : req.body.name,
        email : req.body.email,
    }

    if(req.files) {

        
        //deleting the picture from cloudinary 
        const user = await User.findById(userId);
        const imageId = user.photo.id;
        const response = cloudinary.v2.uploader.destroy(imageId)

        //uploading the new received image
        let file = req.files.photo
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder : "users",
            width : "150",
            crop : "scale"
        })

        newData.photo = {
            id : result.public_id,
            secure_url : result.secure_url
        }

    }

    const user = await User.findByIdAndUpdate(userId, newData, {
        new : true,
        runValidators : true,
        useFindAndModify : false,
    })

    res.status(200).json({
        success : true,
        message : "Update Completed"
    })

})  





//only admin can access these routes 


exports.adminAllUsers = BigPromise(async(req,res,next) => {
    const users = await User.find({})

    res.status(200).send({
        sucess: true,
        users
    })
})


//get only a particular user 
exports.adminGetOneUser = BigPromise(async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new CustomError('User not found', 400));
    }


    res.status(200).json({
        sucess: true,
        user
    })

})

//admin updates a particular user 
exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
    
  
   
    const newData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
  
    // update the user in database
    const user = await User.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

  
    res.status(200).json({
      success: true,
    });
});


//admin can delete a particular user
exports.adminDeleteUser = BigPromise(async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new CustomError('No such user found', 400));
    }

    const imageId = user.photo.id;

    //deleting the image from the cloud
    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({
        sucess : true,
        message : "User Deleted"
    })

})






//manager specific route - to get all users
exports.managerAllUsers = BigPromise(async(req,res,next) => {

    const users = await User.find({role : 'user'})

    res.status(200).send({
        sucess: true,
        users
    })
})


