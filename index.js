const {config} =require("./config/config_env")
const authApi=require("./routes/auth");
const express= require('express');
const cors = require("cors");
const app= express();
const BooksApi = require('./routes/libros.js');
//app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors({ origin: "https://front-recomendacion-contenidos.herokuapp.com" }));
app.use(express.json());
BooksApi(app);
authApi(app);
app.listen(config.port,()=>{
    console.log(`Listening http://localhost:${config.port}`)
})