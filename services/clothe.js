const MongoLib = require('../lib/mongo_Clothe');

class ClothesService{
    constructor(){

        this.collection='Clothe';
        this.mongoDB= new MongoLib();
    }


    


    async geClothes(){
        const clothes = await this.mongoDB.getAll(this.collection /*, query*/)
        return clothes || [];
    }
   
}
module.exports = ClothesService;