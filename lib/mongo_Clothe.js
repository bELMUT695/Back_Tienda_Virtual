const { MongoClient, ObjectId } = require("mongodb");
const { config } = require("../config/config_env");

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);

const DB_NAME = config.dbName;

const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}/${DB_NAME}?retryWrites=true&w=majority`;

class MongoLib {
  constructor() {
    this.client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.dbName = DB_NAME;
  }

  connect() {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect((err) => {
          if (err) {
            reject(err);
          }
          console.log("Connected succesfully");
          resolve(this.client.db(this.dbName));
        });
      });
      // console.log(MongoLib.connection.collection('Clothe'))
    }
    return MongoLib.connection;
  }

  getAll(collection) {
    return this.connect().then((db) => {
      return db
        .collection(collection)

        .aggregate([
          {
            $lookup: {
              from: "Image",
              localField: "id_image",
              foreignField: "_id",
              as: "image",
            },
          },
        ])
        .toArray();
    });
  }
  getAllKluster(collection, cluster) {
    return this.connect().then((db) => {
      return db
        .collection(collection)
        .aggregate([
          { $match: { k: cluster } },
          {
            $lookup: {
              from: "itti_saliency",
              localField: "ID_CLOTHE",
              foreignField: "idClothe",
              as: "VISUAL_ATTENTION",
            },
          },
        ])
        .toArray();
    });
  }

  getAllClothesVisualAtentionKluster(collection, id) {
    return this.connect().then((db) => {
      return db
        .collection(collection)
        .aggregate([
          {
            $match: {
              _id: parseInt(id),
            },
          },
          {
            $lookup: {
              from: "itti_saliency",
              localField: "_id",
              foreignField: "idClothe",
              as: "VISUAL_ATTENTION",
            },
          },
        ])
        .toArray();
    });
  }

  getAllClotheRatingUsers(collection) {
    return this.connect().then((db) => {
      return db
        .collection(collection)
        .aggregate([
          {
            $lookup: {
              from: "Clothe_User_Rating",
              localField: "_id",
              foreignField: "ID_CLOTHE",
              as: "Rating",
            },
          },
        ])
        .toArray();
    });
  }

  getEmail(collection, query) {
    return this.connect().then((db) => {
      return db.collection(collection).find(query).toArray();
    });
  }

  create(collection, data) {
    return this.connect()
      .then((db) => {
        return db.collection(collection).insertOne(data);
      })
      .then((result) => result.insertedId);
  }

  insertValueRating(collection, data) {
    return this.connect()
      .then((db) => {
        return db.collection(collection).insertOne(data);
      })
      .then((result) => result.insertedId);
  }
  getClohtebyId(collection, id) {
    return this.connect().then((db) => {
      // console.log(typeof(id),"SDD")
      return db
        .collection(collection)
        .aggregate([
          { $match: { _id: parseInt(id) } },
          {
            $lookup: {
              from: "Image",
              localField: "id_image",
              foreignField: "_id",
              as: "image",
            },
          },
        ])
        .toArray();
    });
  }

  getAttentionVisual(collection, nkluster) {
    return this.connect().then((db) => {
      // console.log(typeof(id),"SDD")
      return db
        .collection(collection)
        .aggregate([
          { $match: { k: parseInt(nkluster) } },
          {
            $lookup: {
              from: "Visual_Attention",
              localField: "id_image",
              foreignField: "_id",
              as: "visual_attention",
            },
          },
        ])
        .toArray();
    });
  }

  getKlusterId(collection, id) {
    return this.connect().then((db) => {
      return db
        .collection(collection)
        .find({ ID_USER: parseInt(id) }, { projection: { k: 1, _id: 0 } })
        .toArray();
    });
  }

  getClohtebyCategory(collection, category) {
    return this.connect().then((db) => {
      console.log(category, "SSSSSSSSddd");
      return db
        .collection(collection)
        .find({ id_categoria: parseInt(category) })
        .toArray();
    });
  }
  getClohtebyCategoryGender(collection, category) {
    return this.connect().then((db) => {
      console.log(category, "holi");
      return db
        .collection(collection)

        .aggregate([
          { $match: { gender: category } },
          {
            $lookup: {
              from: "Image",
              localField: "id_image",
              foreignField: "_id",
              as: "image",
            },
          },
        ])
        .toArray();
    });
  }

  getClohtebyRecomendedId(collection, id) {
    console.log(parseInt(id[0]));
    const recomendedArray = [];

    return this.connect().then(async (db) => {
      // console.log(typeof(id),"SDD")
      for (let i = 0; i < id.length; i++) {
        recomendedArray.push(
          await db
            .collection(collection)
            .aggregate([
              { $match: { _id: parseInt(id[i]) } },
              {
                $lookup: {
                  from: "Image",
                  localField: "id_image",
                  foreignField: "_id",
                  as: "image",
                },
              },
            ])
            .toArray()
        );
      }
      return recomendedArray;
    });
  }

  getClohteRatingValue(collection, category) {
    return this.connect().then((db) => {
      // console.log(typeof category, collection);
      return db
        .collection(collection)

        .find({ ID_CLOTHE: parseInt(category) })
        .toArray();
    });
  }

  getUserRatingValue(collection, iduser, idclote) {
    return this.connect().then((db) => {
      // console.log(typeof category, collection);
      return db
        .collection(collection)

        .find({ ID_USER: parseInt(iduser), ID_CLOTHE: parseInt(idclote) })
        .toArray();
    });
  }

  getSearch(collection, clothe, user) {
    return this.connect().then((db) => {
      return db.collection(collection).findOne({
        ID_CLOTHE: parseInt(clothe),
        ID_USER: parseInt(user),
      });
    });
  }

  update(collection, id, data) {
    return this.connect()
      .then((db) => {
        return db
          .collection(collection)
          .updateOne({ _id: ObjectId(id) }, { $set: data });
      })
      .then((result) => result.upsertedId || id);
  }

  ratinValueUpdateOne(collection,id,value){
    return this.connect()
    .then((db)=>{
      return db
      .collection(collection)
      .updateOne({ _id: ObjectId(id) }, { $set: value});
    }
  }
}
module.exports = MongoLib;
