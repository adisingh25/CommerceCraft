class CustomError extends Error {
    constructor(message,code) {
        super(message);
        this.code = code;
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = CustomError;


// This will help us define our own custom error that we will require in our code