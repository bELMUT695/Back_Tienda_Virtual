const MongoLib = require("../lib/mongo_Clothe");

class ClotheUserService {
  constructor() {
    this.collection = "Clothe_User_Rating";
    this.mongoDB = new MongoLib();
  }

  async getClotheUser() {
    const clothe_users = await this.mongoDB.getAll(this.collection);
    return clothe_users || [];
  }

  async getClotheUserByrating(clotheid) {
    const clothe = await this.mongoDB.getClohteRatingValue(
      this.collection,
      clotheid
    );
    return clothe || {};
  }
}

module.exports = ClotheUserService;
