const { Schema, model} = require('mongoose')

const prenda_user = new Schema({
    User_ID: {
        ref: "prenda",
        type: Schema.Types.ObjectId
    },
    Item_ID: {
        ref: "user",
        type: Schema.Types.ObjectId
    },
    rating : {
        type:Number
    },
       
}, {
    timestamps: true
})

module.exports = model('Rol',rolSchema)