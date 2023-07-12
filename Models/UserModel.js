const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
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
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
});

const UserModel = mongoose.model('UserModel', userModel)

module.exports = UserModel