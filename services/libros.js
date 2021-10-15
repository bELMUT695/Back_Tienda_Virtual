const MongoLib = require('../lib/Mongo_Libros');

class BooksService{
    constructor(){

        this.collection='Libros';
        this.mongoDB= new MongoLib();
    }


    


    async getMovies(){
        const movies = await this.mongoDB.getAll(this.collection /*, query*/)
        return movies || [];
    }
   
}
module.exports = BooksService;