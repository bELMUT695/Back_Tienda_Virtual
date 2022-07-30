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

  async getAllKluster(cluster) {
    const clothe_users = await this.mongoDB.getAllKluster(
      this.collection,
      cluster
    );
    return clothe_users || [];
  }

  async getKlusterId(userId) {
    const kluster = await this.mongoDB.getKlusterId(this.collection, userId);
    return kluster || [];
  }

  async getClotheUserByrating(clotheid) {
    const clothe = await this.mongoDB.getClohteRatingValue(
      this.collection,
      clotheid
    );
    return clothe || {};
  }

  async getUserUserByrating(userid, clotheid) {
    const clothe = await this.mongoDB.getUserRatingValue(
      this.collection,
      userid,
      clotheid
    );
    return clothe || {};
  }

  async getAllKluster1(cluster) {
    const clothe_users = await this.mongoDB.getAllKluster1(
      this.collection,
      cluster
    );
    return clothe_users || [];
  }
  async updateValueRating(id, objectValueRating) {
    console.log(objectValueRating, id, "service");
    const clothe = await this.mongoDB.ratingValueUpdateOne(
      this.collection,
      id,
      objectValueRating
    );
    return clothe || {};
  }

  async getClotheUser1(clothe, user) {
    const clothe_user = await this.mongoDB.getSearch(
      this.collection,
      clothe,
      user
    );
    return clothe_user || {};
  }

  async updateClotheUser(id, data) {
    const updateNewId = await this.mongoDB.update(this.collection, id, data);
    return updateNewId;
  }

  async getAttentionVisualbyId(nkluster) {
    const clothes = await this.mongoDB.getAttentionVisual(
      this.collection,
      nkluster
    );
    return clothes || {};
  }
  async postValueRating(data) {
    const clothes = await this.mongoDB.insertValueRating(this.collection, data);
  }
}

module.exports = ClotheUserService;
