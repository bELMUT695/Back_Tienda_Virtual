const express     = require("express");
const math        = require("mathjs");
var jd            = require("jsdataframe");
var linearAlgebra = require("linear-algebra")(), // initialise it
  Vector = linearAlgebra.Vector,
  Matrix = linearAlgebra.Matrix;

const ClotheUsersServices = require("../services/clothe_user");
var recommendations       = require("../lib/jaccard");
var CoRatedItemsUser      = require("../lib/coRatedItemsUser");
const ClothesServices     = require("../services/clothe");
const cacheResponse       = require("../utils/cacheResponse");


const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS,
} = require("../utils/time");


function ClotheUserApi(app) {
  const router = express.Router();
  app.use("/api/rating", router);


  const clotheUsersServices = new ClotheUsersServices();
  const clothesServices = new ClothesServices();


  router.get("/:userId", async function (req, res, next) {
    const { userId } = req.params;

    console.log("Lest's go!!!!!!!");

    const { tags } = req.query;


    try {
      
      const userCluster = await clotheUsersServices.getKlusterId(userId);
      console.log("userCluster: ", userCluster);


      // nuevo usuario o usuario sin calificaiones
      if(userCluster.length === 0) {

        return res.status(400).json({
          message: 'Usuario no tiene ninguna calificacion',
        });
      }


      const kuser = [];
      for(let i=0; i<userCluster.length; i++) {
        kuser.push(userCluster[i].k);
      }
      console.log('kuser', kuser)

      // Selecciona el cluster con mas fuerza
      const highest = arr => (arr || []).reduce( ( acc, el ) => {
        acc.k[el] = acc.k[el] ? acc.k[el] + 1 : 1
        acc.max = acc.max ? acc.max < acc.k[el] ? el : acc.max : el
        return acc  
      }, { k:{} }).max

      const kelegido = highest(kuser);
      console.log('kelegido', kelegido)


      const ClotheUsers = await clotheUsersServices.getAllKluster(kelegido);
      console.log("ClotheUsers: ", ClotheUsers);
      console.log('-------------------------------------------------------------------');


      //const clasification1 = [];
      const clasification1 = ClotheUsers.filter(e => 
        e.RATING === 1
      )
      const clasification2 = ClotheUsers.filter(e => 
        e.RATING === 2 || e.RATING === 3
      )
      const clasification3 = ClotheUsers.filter(e => 
        e.RATING === 4 || e.RATING === 5
      )
      console.log("clasification1: ", clasification1);
      console.log("clasification2: ", clasification2);
      console.log("clasification3: ", clasification3);
      ('-------------------------------------------------------------------');


      const fechaActual = new Date();

      // MUTATIONS .....
      const mutation1 = clasification1.map(e => {
        const createdAtt = new Date(e.TIME_STAMP.toString());
        const fechafinal = ((fechaActual.getTime() - createdAtt.getTime())/ (1000*60*60*24*365)).toFixed(4);
    
        return {
          _id: e._id,
          RATING: Math.round(e.RATING * (Math.pow(fechafinal,-0.345)*0.393)),
          ID_USER: e.ID_USER,
          ID_CLOTHE: e.ID_CLOTHE,
          TIME_STAMP: e.TIME_STAMP,
        }
      });
      const mutation2 = clasification2.map(e => {
        const createdAtt = new Date(e.TIME_STAMP.toString());
        const fechafinal = ((fechaActual.getTime() - createdAtt.getTime())/ (1000*60*60*24*365)).toFixed(4);
    
        return {
          _id: e._id,
          RATING: Math.round(e.RATING * (2/(1+Math.pow(Math.E,(0.345*(fechafinal)))))),
          ID_USER: e.ID_USER,
          ID_CLOTHE: e.ID_CLOTHE,
          TIME_STAMP: e.TIME_STAMP,
        }
      });
      const mutation3 = clasification3.map(e => {
        const createdAtt = new Date(e.TIME_STAMP.toString());
        const fechafinal = ((fechaActual.getTime() - createdAtt.getTime())/ (1000*60*60*24*365)).toFixed(4);
    
        return {
          _id: e._id,
          RATING: Math.round(e.RATING * (Math.pow(Math.E,(-0.345*(fechafinal))))),
          ID_USER: e.ID_USER,
          ID_CLOTHE: e.ID_CLOTHE,
          TIME_STAMP: e.TIME_STAMP,
        }
      });
      console.log("mutation1: ", mutation1);
      console.log("mutation2: ", mutation2);
      console.log("mutation3: ", mutation3);

      const clotheusers1Concat = mutation1.concat(mutation2).concat(mutation3);
      console.log("clotheusers1Concat: ", clotheusers1Concat);
      console.log('-------------------------------------------------------------------');


      var dataframe = jd.dfFromObjArray(clotheusers1Concat);
      console.log("dataframe: ");
      dataframe.p();
      console.log('-------------------------------------------------------------------');


      var dataframeSort = dataframe.sort("ID_USER");
      console.log("dataframeSort: ");
      dataframeSort.p();
      console.log('-------------------------------------------------------------------');


      var Newdataframe = dataframeSort.s(jd.rng(0, 3300), [
        "ID_CLOTHE",
        "RATING",
        "ID_USER",
      ]);
      console.log("Newdataframe: ");
      Newdataframe.p();
      console.log('-------------------------------------------------------------------');


      var pivotedMatrix = Newdataframe.pivot("ID_CLOTHE", "RATING");
      console.log("pivotedMatrix: ");
      pivotedMatrix.p();
      console.log('-------------------------------------------------------------------');

      var pivotedMatrixItems = Newdataframe.pivot("ID_USER", "RATING");
      console.log("pivotedMatrixItems: ");
      pivotedMatrixItems.p();
      console.log('-------------------------------------------------------------------');
      
      //console.log(pivotedMatrix.nCol(), "fssdsds");
      // console.log(pivotedMatrix.p()[1])


      var interaction_matrix = pivotedMatrix
        .s(null, jd.rng(1, pivotedMatrix.nCol()))
        .toMatrix();
      console.log("interaction_matrix: ", interaction_matrix);
      console.log('-------------------------------------------------------------------');


      var clusterRatingMatrix = new Matrix(interaction_matrix);
      console.log("clusterRatingMatrix: ", clusterRatingMatrix);
      console.log('-------------------------------------------------------------------');


      var IndiceUser = pivotedMatrixItems._names.values.indexOf(userId);
      console.log("IndiceUser: ", IndiceUser);
      console.log('-------------------------------------------------------------------');


      var ItemsValues = pivotedMatrix._names.values;
      console.log("ItemsValues: ", ItemsValues);
      console.log('-------------------------------------------------------------------');

      
      var normalizedMatrix = clusterRatingMatrix.map(function (v) {
        //console.log((isNaN(v)))
        return isNaN(v) ? 0 : v;
      });
      console.log("normalizedMatrix: ", normalizedMatrix);
      console.log('-------------------------------------------------------------------');


      const RatedUser = normalizedMatrix.data[IndiceUser - 1];
      console.log("RatedUser: ", RatedUser);
      console.log('-------------------------------------------------------------------');
      //const  CoItemsRatedUser=CoRatedItemsUser


      ratingsMatrix = math.matrix(normalizedMatrix.data);
      console.log("ratingsMatrix: ", ratingsMatrix);
      console.log("ratingsMatrix.size()[1]: ", ratingsMatrix.size()[1]);
      console.log('-------------------------------------------------------------------');


      const ratedItemsForUser = CoRatedItemsUser.CoRatedItemsUser(
        RatedUser,
        ratingsMatrix.size()[1]
      );
      console.log("ratedItemsForUser: ", ratedItemsForUser);
      console.log('-------------------------------------------------------------------');


      const IndexItemsRecomendation = recommendations.CFilterJaccard(
        normalizedMatrix.data,
        ratedItemsForUser
      );
      console.log("IndexItemsRecomendation: ", IndexItemsRecomendation);
      console.log("IndexItemsRecomendation.length: ", IndexItemsRecomendation.length);
      console.log('-------------------------------------------------------------------');

      
      const Items_ID_Recomendation = [];
      for (let index = 0; index < IndexItemsRecomendation.length; index += 1) {
        Items_ID_Recomendation.push(
          ItemsValues[IndexItemsRecomendation[index] + 1]
        );
      }
      console.log("Items_ID_Recomendation: ", Items_ID_Recomendation);
      console.log('-------------------------------------------------------------------');

      /* PROBAR */
      const ClotheRecomended11 = [];
      console.log('Items_ID_Recomendation.length', Items_ID_Recomendation.length);
      for(let i=0; i<Items_ID_Recomendation.length; i++) {
        ClotheRecomended11[i] = await clothesServices.getClothe(
        Items_ID_Recomendation[i]
        );
      }  
      console.log("ClotheRecomended11: ", ClotheRecomended11);
      console.log('-------------------------------------------------------------------');


      res.status(200).json({
        data: ClotheRecomended11,
        message: "Item recomendation listed",
      });
    } catch (err) {
      next(err);
    }
  });

  
  router.get("/value-rating/:Id", async function (req, res, next) {
    const { Id } = req.params;

    try {
      const clothes = await clotheUsersServices.getClotheUserByrating(Id);


      res.status(200).json({
        data: clothes,
        message: "categorias encontradass",
      });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = ClotheUserApi;