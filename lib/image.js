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

 
}