const express = require('express');
const ClotheUsersServices = require('../services/clothe_user');
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
            //dataframe.p();
            var Newdataframe= dataframe.s(jd.rng(0, 999), ['ID_Producto', 'Rating','ID_Usuario']);
            Newdataframe.p();
            var pivotedMatrix = Newdataframe.pivot('ID_Producto', 'Rating');
            pivotedMatrix.p();
            //var interaction_matrix = pivotedMatrix.s(null, jd.rng(1, pivotedMatrix.nCol())).toMatrix();
           // var clusterRatingMatrix = new Matrix(interaction_matrix);
           // console.log(clusterRatingMatrix)
            console.log("BBB")
     
      res.status(200).json({
        data: ClotheUsers,
        message: 'clothe_users listed',
      });
    } catch(err){
      next(err);
    }
  });
  
}

module.exports = ClotheUserApi;
