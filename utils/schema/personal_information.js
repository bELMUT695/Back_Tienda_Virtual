const {Schema, model}= require('mongoose')

const Personal_information = Schema({
    nombre : {
        type:String
    },
    apellido : {
        type: String
    },
    genero : {
        type:String
    },
    edad : {
        type:Number
    },
    telefono : {
      type:String
  },
},{
    timestamps:true
})

module.exports = model('Personal_information',Personal_information)