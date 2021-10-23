const express = require('express');
const ClotheUsersServices = require('../services/clothe_user');
const cacheResponse = require('../utils/cacheResponse');

const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS
} = require('../utils/time');

function ClotheUserApi(app){
  const router = express.Router();
  app.use('/api/rating', router);
  const clotheUsersServices = new ClotheUsersServices();

  router.get('/', async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    const { tags } = req.query;

    try{
      const ClotheUsers = await clotheUsersServices.getClotheUser();

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
