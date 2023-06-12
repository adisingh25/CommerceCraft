const BigPromise = require("../middlewares/bigPromise");

// the 'BigPromise' way to deal with try-catch-error
exports.home = BigPromise((req,res) => {
    res.status(200).send({
        success : true,
        greeting : " Hello from backend"
    })
})



//try-catch block method for error handling 
exports.homeDummy = (req,res) => {
   try {
        res.status(200).send({
            success : true,
            greeting : " Another dummy route"
        })
   } catch (error) {
        console.log(error)
   }
}