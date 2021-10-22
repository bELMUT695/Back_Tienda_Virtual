const {Schema, model}= require('mongoose')
//require('mongoose-double')(mongoose);

//var SchemaTypes = mongoose.Schema.Types;

const Prenda = Schema({
    nombre : {
        type:String
    },
    precio : {
        type: Number
    },
    descripcion : {
        type:String
    },
    stock : {
        type:Number
    },
},{
    timestamps:true
})

module.exports = model('Prenda',Prenda)