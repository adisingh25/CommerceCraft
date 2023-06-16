//this 'whereclause' can be used with any model and at any place we require to get the data from the db

class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    //searching the value in the database
    search() {
        const searchword = this.bigQ.search
          ? {
              name: {                                 //Prodcut.find(email : { "abc@gmail.com"} ) -> what we write inside find is determined using this
                $regex: this.bigQ.search,
                $options: "i",                             // handles case-incensitivity 
              },
            }
          : {};
    
        this.base = this.base.find({ ...searchword });
        return this;
    }



    //handling other filter methods
    //'regex' only works with strings
    filter() {
        const copyQ = {...this.bigQ}

        //deleting values from the object that is not required here, this is the reason behind creating a copy of the bigQ.
        delete copyQ["search"]
        delete copyQ["limit"]
        delete copyQ["page"]

        //change copyQ to string - as regex only works on that 
        let stringOfCopyQ = JSON.stringify(copyQ);

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)/g , m => '$${m}')               //adds '$' to our operators which we will be used to access the value from the db

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ)                      // changing it back to json object

        this.base = this.base.find(jsonOfCopyQ)
        return this;

    }





    //working on the amount of content on the page (how much to keep and how much to skip)
    pager(resultperPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
          currentPage = this.bigQ.page;
        }
    
        const skipVal = resultperPage * (currentPage - 1);
    
        this.base = this.base.limit(resultperPage).skip(skipVal);
        return this;
    }

    

}


module.exports = WhereClause;

// base - Product.find({})
//bigQ - search=coder&page=2&category=shirts&rating[gte]=4&price[lte]=999&price[gte]=100
// So, we have 3 main parts of this bigQ - search, page(pagination), rest all paramteres like ratings,price etc