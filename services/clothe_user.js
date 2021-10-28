const MongoLib = require('../lib/mongo_Clothe');

class ClotheUserService{
  constructor(){
    this.collection='Clothe_User';
    this.mongoDB=new MongoLib();
  }

  async getClotheUser(){
    const clothe_users = await this.mongoDB.getAll(this.collection);
    return clothe_users || [];
  }

}

module.exports = ClotheUserService;