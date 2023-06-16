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
    req.body.user = req.user.id;

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

    let products = await productsObj.base;                  // that object has base which has our entires
    const filteredProductCount = products.length

    //pagination 1st way 
    // products.limit(5).skip(5)



    //pagination 2nd way
    productsObj.pager(resultperPage)                  //pager is coming from the WhereClause class and can only be applied over the object
    products = await productsObj.base.clone()        // '.clone()' is a new-way to handle and run multiple queries (like  - and condition1 and condition2 and condition3) #again call run only over the objects of the WhereClause class
   

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