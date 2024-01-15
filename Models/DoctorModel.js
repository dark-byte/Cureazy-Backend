const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // photos
  profilePic:
  {
    type: String,
  },
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
  },
  specialization: {
    type: String,
    required: true
  },
  clinicIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicModel',
      required: true
    }
  ]
});

const DoctorModel = mongoose.model('DoctorModel', doctorSchema);

module.exports = DoctorModel;
