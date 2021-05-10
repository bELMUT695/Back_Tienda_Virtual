const {config} =require("./config/config_env")

const express= require('express');

const app= express();
const BooksApi = require('./routes/libros.js');

BooksApi(app);
app.listen(config.port,()=>{
    console.log(`Listening http://localhost:${config.port}`)
})