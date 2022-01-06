const express = require('express');
const { typeOf} = require('mathjs');
const ClothesServices = require('../services/clothe');
const cacheResponse = require('../utils/cacheResponse');
const {
    FIVE_MINUTES_IN_SECONDS,
    SIXTY_MINUTES_IN_SECONDS
  } = require('../utils/time');

  
function ClotheApi(app){
    const router = express.Router();
    app.use('/api/clothe',router);
    const clothesServices = new ClothesServices();
   

      router.get("/gender",async function(req,res,next){
        cacheResponse(res.FIVE_MINUTES_IN_SECONDS);
   
        try {
          const clothes=await clothesServices.getClohtebyGender();
          res.status(200).json({
            data:clothes,
            message:'categorias encontrada'
          });
        } catch (error) {
          next(error)
        }
      })

   
   
}

module.exports =  ClotheApi;