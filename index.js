const {config} =require("./config/config_env")
const authApi=require("./routes/auth");
const express= require('express');

const app= express();
const BooksApi = require('./routes/libros.js');
app.use(express.json());
BooksApi(app);
authApi(app);
app.listen(config.port,()=>{
    console.log(`Listening http://localhost:${config.port}`)
})