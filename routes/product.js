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












module.exports = router;