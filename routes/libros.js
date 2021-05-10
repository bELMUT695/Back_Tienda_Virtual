const express = require('express');
const LibrosServices = require('../services/libros');
const cacheResponse = require('../utils/cacheResponse');
const {
    FIVE_MINUTES_IN_SECONDS,
    SIXTY_MINUTES_IN_SECONDS
  } = require('../utils/time');

  
function BooksApi(app){
    const router = express.Router();
    app.use('/api/libros',router);
    const BookService = new LibrosServices();
    router.get('/', async function (req, res, next) {
        cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
        const { tags } = req.query;
        console.log(tags)
        try {
          const Libros = await BookService.getMovies(/*{ tags }*/);
          // throw new Error("Error getting movies");
          res.status(200).json({
            data: Libros,
            message: 'movies listed'
          });
        } catch (error) {
          next(error);
        }
      });
    
}

module.exports =  BooksApi;