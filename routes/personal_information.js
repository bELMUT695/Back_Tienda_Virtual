const express = require('express');
const PersonalInformationServices = require('../services/personal_information');
const cacheResponse = require('../utils/cacheResponse');
const {
    FIVE_MINUTES_IN_SECONDS,
    SIXTY_MINUTES_IN_SECONDS
  } = require('../utils/time');

  
function PersonalInformationApi(app){
    const router = express.Router();
    app.use('/api/information',router);
    const personalInformationServices = new PersonalInformationServices();
    router.get('/', async function (req, res, next) {
        cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
        const { tags } = req.query;
       
        try {
          const PersonalInformation = await personalInformationServices.gePersonalInformation(/*{ tags }*/);
         
          // throw new Error("Error getting movies");
          res.status(200).json({
            data: PersonalInformation,
            message: 'information listed',
          });
        } catch (error) {
          next(error);
        }
        
      });
    
}

module.exports =  PersonalInformationApi;