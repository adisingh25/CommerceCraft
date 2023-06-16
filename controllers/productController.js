const Product = require('../models/product')
const BigPromise = require('../middlewares/bigPromise');            // use this or instead use try-catch block 
const cloudinary = require('cloudinary');
const CustomError = require('../utils/customError');
const WhereClause = require('../utils/whereClause')



exports.addProduct = BigPromise(async(req,res,next) => {


    //images 
    let imageArray = []

    if(!req.files) {
        return next(new CustomError('Images are required', 400))
    }

    if(req.files) {
        for(let i =0; i<req.files.photos.length; i++) {
            // const element = req.files.photos[i];
    

            let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
                folder : 'products'
            })

            imageArray.push({ 
                id : result.public_id,
                secure_url : result.secure_url
            })
        }
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;                    // we only store the user's id as user in the product database

    const product = await Product.create(req.body);

    res.status(200).json({
        success : true,
        product
    })

});

exports.getAllProduct = BigPromise(async(req,res,next) => {

    const resultperPage = 3;
    const totalcountProduct = await Product.countDocuments();                //one way of counting how many products do we actually have


    const productsObj = new WhereClause(Product.find(), req.query).search().filter()        // WhereClause returns an object

    let products = await productsObj.base;                  // that object has base which has our entries
    const filteredProductCount = products.length

    //pagination 1st way 
    // products.limit(5).skip(5)



    //pagination 2nd way
    productsObj.pager(resultperPage)                  //pager is coming from the WhereClause class and can only be applied over the object
    products = await productsObj.base.clone()        // '.clone()' is a new-way to handle and run multiple queries (like  - and condition1 and condition2 and condition3) #again, call can run only over the objects of the WhereClause class
   

    res.status(200).json({
        success : true,
        products,
        filteredProductCount,
        totalcountProduct
    })

    
})

exports.adminGetAllProduct = BigPromise(async(req,res,next) => {

    const products = await Product.find({})

    if(!products) {
        return next(new CustomError('No Products are there', 400))
    }

    res.status(200).json({
        success : true,
        products
    })
})


exports.getProductDetail = BigPromise(async(req,res,next) => {

    const productId = req.params.id;

    const product = await Product.findById(productId)

    if(!product) {
        return next(new CustomError('No such product is found', 400))
    }


    res.status(200).json({
        success : true,
        product
    })

})


exports.adminProductUpdate = BigPromise(async(req,res) => {
    let product = await Product.findById(req.params.id)

    if(!product) {
        return next(new CustomError('NO Product Found', 400))
    }

    let imagesArray = []
    
    

    if(req.files) {

        //we first destroy the images already stored and then upload the new images 
        //destroying the already stored images
        for(let i =0; i<product.photos.length; i++) {
            await cloudinary.v2.uploader.destroy(product.photos[i].id)
        }

        

        //uploading new images
       
        for(let i =0; i<req.files.photos.length; i++) {
            // const element = req.files.photos[i];
    

            let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
                folder : 'products'
            })

            imagesArray.push({ 
                id : result.public_id,
                secure_url : result.secure_url
            })
        }


    }


    req.body.photos = imagesArray           // this imagesArray is now available in the exact form we need, while storing or updating the db
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true,
        useFindAndModify : false
    })


    res.status(200).json({
        success : true,
        product
    })

})


exports.adminDeleteProduct = BigPromise(async(req,res,next) => {

    const product = await Product.findById(req.params.id)

    if(!product) {
        return next(new CustomError('No product Found', 400));
    }

    //destroying all the images stored on the db wrt that product
    for(let i =0; i<product.photos.length; i++) {
        await cloudinary.v2.uploader.destroy(product.photos[i].id)
    }

    await product.deleteOne()                     // since we have extracted the object of that product from the db, we can directly write product.remove() or product.deleteOne() to delete this from the database


    res.status(200).json({
        success : true,
        message : "Product was deleted"
    })

})

exports.addReview = BigPromise(async(req,res,next) => {

    const {rating, comment, productId} = req.body;

    const review = {
        user : req.user._id,                   //the middleware gives me all of this
        name: req.user.name,
        rating :Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    //checking if the user has already added a review
    const alreadyPresentReviews = product.reviews.find( (rev) => rev.user.toString() === req.user._id.toString() )          // toString is necessary as whatever we receive is a BSON type of object

    if(alreadyPresentReviews) {
        product.reviews.forEach((rev) => {
           if ( (rev) => rev.user.toString() === req.user._id.toString() ) {
                rev.comment = comment;
                rev.rating = rating
           }
        })
    }
    else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length;
    }

    product.ratings =  product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    
    res.status(200).json({
        success: true,
    });

})

//delete route not working ................
// exports.deleteReview = BigPromise(async (req, res, next) => {
//     const { productId } = req.query;
  

//     const product = await Product.findById(productId);
//     console.log(product)
  
//     const reviews = product.reviews.filter(                               // filter method removes the review that we want to delete
//       (rev) => rev.user.toString() === req.user._id.toString()
//     );
  
//     const numberOfReviews = reviews.length;
  
//     // adjust ratings
  
//     ratings =
//       product.reviews.reduce((acc, item) => item.rating + acc, 0) /
//       product.reviews.length;
  
//     //update the product
  
//     await Product.findByIdAndUpdate(
//       productId,
//       {
//         reviews,
//         ratings,
//         numberOfReviews,
//       },
//       {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//       }
//     );
  
//     res.status(200).json({
//       success: true,
//     });
// });
  
exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
});