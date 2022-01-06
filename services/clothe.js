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

    async getClothe(clotheid){
        
         const clothe=await this.mongoDB.getClohtebyId(this.collection ,clotheid);
         return clothe ||{};
    }

    async getClohtebyId(categoryId){
        const clothes =await this.mongoDB.getClohtebyCategory(this.collection,categoryId);
        return clothes || {};
    }

    async getClohtebyGender(){
        
        const clothes =await this.mongoDB.getClohtebyCategoryGender(this.collection);
        return clothes || {};
    }
    
    
    
   
}
module.exports = ClothesService;