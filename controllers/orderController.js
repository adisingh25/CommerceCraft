const Order = require('../models/order')
const Product = require('../models/product')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')


exports.createOrder = BigPromise(async(req,res,next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    // very important to understand 
    // whenever we use 'ref' in our models we want to store the object of that which is acutually a BSON data, 
    // but with new update a string data which has the 'id' of that all works to indentify that refering that object
    // given below is an example of this
    // console.log(req.user.id)               // this just gives the id of the user creating the order - ------                             OUTPUT ->  648988d9520a88ac1832ff34
    // console.log(req.user._id)              // this gives the id of the user in the BSON format directly coming from the db - ----------  OUTPUT ->  new ObjectId("648988d9520a88ac1832ff34")


    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id,               // this is coming from mongodb directly. Therefore, we have '_id' as our property. 'req.user.id' will also work (explanation is written above)
    });
    

    res.status(200).json({
        success: true,
        order,
    });


})


exports.findOrder = BigPromise(async(req,res,next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",                                                    // this will ensure that 'user' field gets drilled down and instead of just getting id, we will get his name and email also
        "name email"
    );
    
    if (!order) {
        return next(new CustomError("please check order id", 401));
    }
    
    res.status(200).json({
        success: true,
        order,
    });
})



exports.getCurrentUserOrder = BigPromise(async(req,res,next) => {
    const order = await Order.find({user : req.user.id})
    
    if (!order) {
        return next(new CustomError('No orders to show', 401));
    }
    
    res.status(200).json({
        success: true,
        order,
    });
})


exports.admingetAllOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find();
  
    res.status(200).json({
      success: true,
      orders,
    });
});


exports.adminUpdateOrder = BigPromise(async (req, res, next) => {


    const order = await Order.findById(req.params.id);
  
    if (order.orderStatus === "Delivered") {
      return next(new CustomError("Order is already marked for delivered", 401));
    }
  
    order.orderStatus = req.body.orderStatus;
  
    order.orderItems.forEach(async (prod) => {
      await updateProductStock(prod.product, prod.quantity);
    });
  
    await order.save();
  
    res.status(200).json({
      success: true,
      order,
    });
});
  
exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    await order.deleteOne();
  
    res.status(200).json({
      success: true,
    });
});
  

// a seprate function which is use to modify the stock value is the PRODUCT table while we are updating orders
async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });
}