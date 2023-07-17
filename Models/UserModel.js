const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  address: {
    type: String
  },
  pincode: {
    type: Number,
    min: 100000,
    max: 999999,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
});

const UserModel = mongoose.model('UserModel', userModel)

module.exports = UserModel