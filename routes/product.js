const express = require('express')
const router = express.Router()
const {isLoggedIn, customRole} = require('../middlewares/user')
const {
    addProduct,
    getAllProduct, 
    adminGetAllProduct,
    getProductDetail,
    adminProductUpdate,
    adminDeleteProduct,
    addReview,
    // deleteReview,
    getOnlyReviewsForOneProduct,
} = require('../controllers/productController')

//only admin can add a product 
router.route("/admin/product/add").post(isLoggedIn, customRole("admin"), addProduct)
router.route("/admin/products").get(isLoggedIn, customRole("admin"), adminGetAllProduct)
router.route("/admin/product/:id")
    .put(isLoggedIn, customRole("admin"), adminProductUpdate)
    .delete(isLoggedIn, customRole("admin"), adminDeleteProduct)






//user can get allproducts on the basis of the query passed
router.route("/getallproduct").get(isLoggedIn, getAllProduct)
router.route("/product/:id").get(isLoggedIn, getProductDetail)
router.route("/review").put(isLoggedIn, addReview);                     // it is a 'put' route because we aren't not creating a new object in this , reviews array was already there but it was earlier empty, so we are updating the review array of that product object
// router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getOnlyReviewsForOneProduct);












module.exports = router;