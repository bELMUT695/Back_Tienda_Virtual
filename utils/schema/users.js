const mongoose = require('mongoose');
const ID = require("nodejs-unique-numeric-id-generator")


const userSchema = new mongoose.Schema(
  {
    _id: { 
      type: Number, 
      default: function genID() {
        return ID.generate(new Date().toJSON());
      }
    },
    first_name: { 
      type: String,  
      required: true,
    },
    last_name: { 
      type: String,  
      required: true,
    },
    email: {
      type: String, 
      required: true,
      unique: true, 
    },
    password: { 
      type: String, 
    },
    gender: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);


const User = mongoose.model('User', userSchema);

module.exports = User;