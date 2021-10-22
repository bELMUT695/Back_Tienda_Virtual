const MongoLib = require('../lib/mongo_Clothe');

class ApiKeysService {
  constructor() {
    this.collection = "api-keys";
    this.mongoDB = new MongoLib();
  }

  async getApiKey({ token }) {
    const [apikey] = await this.mongoDB.getAll(this.collection, { token });
    return apikey;
  }

}

module.exports = ApiKeysService; 