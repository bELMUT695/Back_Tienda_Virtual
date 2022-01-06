const {MongoClient,ObjectId} = require('mongodb');
const {config} = require('../config/config_env');

const USER =encodeURIComponent(config.dbUser);
const PASSWORD =encodeURIComponent(config.dbPassword);

const DB_NAME=config.dbName;


const MONGO_URI =`mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}/${DB_NAME}?retryWrites=true&w=majority`;

class MongoLib{
     constructor(){
       this.client = new MongoClient(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
        this.dbName = DB_NAME;
     }

     connect(){
         if(!MongoLib.connection){
           
             MongoLib.connection= new Promise((resolve ,reject)=>{
               this.client.connect(err=>{
                  if(err){
                    reject(err);
                  }
                  console.log('Connected succesfully');  
                  resolve(this.client.db(this.dbName));

               });

             });
            // console.log(MongoLib.connection.collection('Clothe'))
         }
         return MongoLib.connection;
     }

  getAll(collection){
      return this.connect()
             .then(db=>{
                 return db 
                  .collection(collection)
                  .find()
                  .toArray();
             })
  }

getEmail(collection,query){
  
    return this.connect().then(db=>{
       return db.collection(collection).find(query).toArray();
    })
}

create(collection,data){
    return this.connect()
    .then(db =>{
      return db
       .collection(collection).insertOne(data)
    })
    .then(result=> result.insertedId)
    }

 getClohtebyId(collection,id){
   return this.connect().then(db=>{
    // console.log(typeof(id),"SDD")
     return db
            .collection(collection)
            .findOne({_id:parseInt(id)})
   })
   
 }  
 
 getClohtebyCategory(collection,category){
  return this.connect().then(db=>{
    console.log(category,"SSSSSSSSddd")
    return db
           .collection(collection)
           .find({id_categoria:parseInt(category)})
           .toArray();
 });


}
getClohtebyCategoryGender(collection,category){
  return this.connect().then(db=>{
    console.log(category,"holi")
    return db
           .collection(collection)
         
           .aggregate([
            { $lookup: 
              {
                from: 'Image',
                localField: 'id_image',
                foreignField: '_id',
                as: 'image'
              }
            },
          ]).toArray();
 });

}
  
}
module.exports = MongoLib;