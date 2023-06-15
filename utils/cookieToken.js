const cookieToken = (user, res) => {


    //grabbing token to sent it to the user
    const token = user.getJwtToken()

    // we will be sending the tokens in the cookies.
    const options = {
        expires : new Date (Date.now() + process.env.COOKIE_TIME*24*60*60* 1000),         // 3days
        httpOnly : true
    }

    user.password = undefined                                     // ensures we are not sending back the password to the user (an alternative way)
    res.status(200).cookie('token', token, options).json({
        success : true,
        token,
        user
    })


}


// this function is used again and again for signup, logging in, forgotPassword work
















module.exports = cookieToken