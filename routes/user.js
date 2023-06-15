const express = require('express')
const router = express.Router()
//middleware
const {isLoggedIn, customRole} = require('../middlewares/user')

const {
    signup, 
    login, 
    logout, 
    forgotPassword, 
    passwordReset, 
    getLoggedInUserDetails, 
    changePassword, 
    upadateDashboard,
    adminAllUsers,
    managerAllUsers,
    adminGetOneUser,
    adminUpdateOneUserDetails,
    adminDeleteUser,
} = require('../controllers/userController')



router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotpassword').post(forgotPassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn,getLoggedInUserDetails)        //injected our middleware
router.route('/changepassword').post(isLoggedIn,changePassword)        //injected our middleware
router.route('/updatedashboard').post(isLoggedIn,upadateDashboard)        //injected our middleware


//only admin can access these routes
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUsers);

//admin - get one user 
router.route("/admin/user/:id")
.get(isLoggedIn, customRole("admin"), adminGetOneUser)
.put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
.delete(isLoggedIn, customRole("admin"), adminDeleteUser)



//only manager can access these routes
router.route("/manager/users").get(isLoggedIn, customRole("manager"), managerAllUsers);





module.exports = router










