const express = require('express');
const math = require('mathjs');
const ClotheUsersServices = require('../services/clothe_user');
var recommendations =require('../lib/jaccard')
var CoRatedItemsUser=require('../lib/coRatedItemsUser')
const cacheResponse = require('../utils/cacheResponse');
var linearAlgebra = require('linear-algebra')(),     // initialise it
    Vector = linearAlgebra.Vector,
    Matrix = linearAlgebra.Matrix;
var jd = require('jsdataframe');

const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS
} = require('../utils/time');

function ClotheUserApi(app){
  const router = express.Router();
  app.use('/api/rating', router);
  const clotheUsersServices = new ClotheUsersServices();

  router.get('/', async function(req, res, next) {

    console.log("Fffffff")
    //cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    const { tags } = req.query;

    try{
      const ClotheUsers = await clotheUsersServices.getClotheUser();
     
            var dataframe = jd.dfFromObjArray(ClotheUsers);
            var dataframeSort =dataframe .sort('ID_USER');
            dataframeSort.p();
           
           
            var Newdataframe= dataframeSort.s(jd.rng(0, 3300), ['ID_CLOTHE', 'RATING','ID_USER']);
            Newdataframe.p();
            var pivotedMatrix = Newdataframe.pivot('ID_CLOTHE', 'RATING');
            var pivotedMatrixItems = Newdataframe.pivot('ID_USER', 'RATING');
           pivotedMatrix.p();
           console.log(pivotedMatrix.nCol(),"fssdsds")
           // console.log(pivotedMatrix.p()[1])
            var interaction_matrix = pivotedMatrix.s(null, jd.rng(1, pivotedMatrix.nCol())).toMatrix();
            


           var clusterRatingMatrix = new Matrix(interaction_matrix);


            var IndiceUser=pivotedMatrixItems._names.values.indexOf('1194982400');
            console.log(IndiceUser,"sssssssss")

            var ItemsValues=pivotedMatrix._names.values;
            console.log(ItemsValues);
             var normalizedMatrix = clusterRatingMatrix.map(function (v) {
               //console.log((isNaN(v)))
              return (isNaN(v)) ? 0 :v;
              });
             // console.log(normalizedMatrix);
        const RatedUser=normalizedMatrix.data[IndiceUser-1];
          //const  CoItemsRatedUser=CoRatedItemsUser
          ratingsMatrix = math.matrix(normalizedMatrix.data);
          const ratedItemsForUser = CoRatedItemsUser.CoRatedItemsUser(RatedUser,ratingsMatrix.size()[1]);
         
          const IndexItemsRecomendation = recommendations.CFilterJaccard(normalizedMatrix.data, ratedItemsForUser); 
          
          console.log(IndexItemsRecomendation.length)
          const  Items_ID_Recomendation= [];
          for (let index = 0; index < IndexItemsRecomendation.length; index += 1){
            Items_ID_Recomendation.push(ItemsValues[IndexItemsRecomendation[index]+1])
          }
          console.log(Items_ID_Recomendation)
     
      res.status(200).json({
        data: Items_ID_Recomendation,
        message: 'Item recomendation listed',
      });
    } catch(err){
      next(err);
    }
  });
  
}

module.exports = ClotheUserApi;
