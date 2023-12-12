const mongoose = require('mongoose');
const DoctorModel = require('./DoctorModel');
const clinicSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String
    },
    directionUrl: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    specialists: {
        type: [String],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    doctors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DoctorModel',
            daysAvailable: {
                type: [String],
                required: true
            },
            timings: {
                type: [
                    {
                        day: String,
                        startTime: String,
                        endTime: String
                    }
                ],
                required: true
            },
            fees: {
                type: Number,
                required: true
            }
        }
    ]
});

const ClinicModel = mongoose.model('ClinicModel', clinicSchema);

module.exports = ClinicModel;
