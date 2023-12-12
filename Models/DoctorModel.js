const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // photos
  name: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    max: 100,
    min: 0
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    max: 100,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  phoneNumber:{
    type: String,
    required: true,
    trim: true
  }
});

const DoctorModel = mongoose.model('DoctorModel', doctorSchema);

module.exports = DoctorModel;
