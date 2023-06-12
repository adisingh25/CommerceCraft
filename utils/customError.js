class CustomError extends Error {
    constructor(message,code) {
        super(message);
        this.code = code;
    }
}

module.exports = CustomError;


// This will help us define our own custom error that we will require in our code