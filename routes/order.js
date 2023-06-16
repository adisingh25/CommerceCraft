const express = require('express')
const router = express.Router()
const {isLoggedIn, customRole} = require('../middlewares/user')
const {
   createOrder,
   findOrder,
   getCurrentUserOrder,
   admingetAllOrders,
   adminUpdateOrder,
   adminDeleteOrder
} = require('../controllers/orderController')


router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/order/myorders').get(isLoggedIn,getCurrentUserOrder)
router.route('/order/:id').get(isLoggedIn,findOrder)



//admin routes
router.route('/admin/allorders').get(isLoggedIn, customRole("admin"), admingetAllOrders)
router.route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);

module.exports = router;