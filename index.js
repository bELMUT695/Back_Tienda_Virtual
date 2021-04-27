const {config} =require("./config/config")

const express= require('express');

const app= express();

app.listen(config.port,()=>{
    console.log(`Listening http://localhost:${config.port}`)
})