const MongoLib = require('../lib/mongo_Clothe');

class PersonalInformationService{
    constructor(){
        this.collection='User';
        this.mongoDB= new MongoLib();
    }

    async gePersonalInformation(){
        const personal_information = await this.mongoDB.getAll(this.collection /*, query*/)
        return personal_information || [];
    }
   
}
module.exports = PersonalInformationService;