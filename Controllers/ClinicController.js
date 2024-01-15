const mongoose = require('mongoose')
const ClinicModel = require('../Models/ClinicModel')
const DoctorModel = require('../Models/DoctorModel')

const isValidUrl = url => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const isValidTime = time => {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return regex.test(time);
};

const addClinic = async (req, res) => {
  try {
    const { clinicName, address, PIN, directionUrl, specialists, phoneNumber, doctors } = req.body;

    const existingClinic = await ClinicModel.findOne({ phoneNumber });

    if (existingClinic) {
      return res.status(409).send({ message: 'Clinic with the phone number already exists.' });
    }

    if (!clinicName || typeof clinicName !== 'string') {
      return res.status(400).send({ message: 'Clinic name is required and must be a string.' });
    }

    if (!PIN || typeof PIN !== 'string') {
      return res.status(400).send({ message: 'PIN  is required and must be a string.' });
    }

    if (typeof directionUrl !== 'string' || !isValidUrl(directionUrl)) {
      return res.status(400).send({ message: 'Direction URL is required and must be a valid URL.' });
    }

    if (!specialists || !Array.isArray(specialists) || !specialists.every(specialist => typeof specialist === 'string')) {
      return res.status(400).send({ message: 'Specialists must be an array of strings.' });
    }

    if (!doctors || !Array.isArray(doctors) || !doctors.every(doctor => typeof doctor === 'object')) {
      return res.status(400).send({ message: 'Doctors must be an array of objects.' });
    }

    for (const doctor of doctors) {
      const { _id, daysAvailable, timings, fees } = doctor;

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({ message: 'Doctor ID is invalid.' });
      }

      if (!daysAvailable || !Array.isArray(daysAvailable) || !daysAvailable.every(day => typeof day === 'string')) {
        return res.status(400).send({ message: 'Days available must be an array of strings.' });
      }

      for (const timing of timings) {
        const { day, startTime, endTime } = timing;

        if (!day || typeof day !== 'string') {
          return res.status(400).send({ message: 'Day within timing must be a string.' });
        }

        if (!startTime || !isValidTime(startTime)) {
          return res.status(400).send({ message: 'Start time within timing is invalid.' });
        }

        if (!endTime || !isValidTime(endTime)) {
          return res.status(400).send({ message: 'End time within timing is invalid.' });
        }
      }

      if (!fees || typeof fees !== 'number' || isNaN(fees)) {
        return res.status(400).send({ message: 'Doctor fees must be a valid number.' });
      }
    }

    const clinic = new ClinicModel({
      clinicName,
      address,
      PIN,
      directionUrl,
      specialists,
      phoneNumber,
      doctors
    });

    console.log(clinic);

    await clinic.save();

    res.status(201).send({ message: 'Clinic added successfully!', clinic });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An internal server error occurred.' });
  }
}

const displayClinics = async (req, res) => {
  try {
    const limit = 16;

    const clinics = await ClinicModel.find({}).sort({ clinicName: 1 }).limit(limit);

    if (clinics.length) {
      return res.status(200).send({ clinics });
    } else {
      return res.status(404).send({ message: 'No clinics found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An internal server error occurred.' });
  }
}

const displayBySpecialists = async (req, res) => {
  try {
    const { specialist } = req.query;

    const limit = 16;

    const trimmedSpecialist = specialist?.trim().toLowerCase();

    const query = {
      specialists: {
        $regex: new RegExp(trimmedSpecialist, "i")
      }
    };

    const clinics = await ClinicModel.find(query)
      .sort({ clinicName: 1 })
      .limit(limit);

    if (clinics.length) {
      return res.status(200).send({ clinics });
    } else {
      if (specialist) {
        return res.status(404).send({ message: `No clinics found matching '${specialist}'. Please try different keywords or broaden your search.` });
      } else {
        return res.status(404).send({ message: 'No clinics found.' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An internal server error occurred.' });
  }
};


const displayByLocality = async (req, res) => {
  try {
    const { pin, address } = req.query;

    const limit = 16;

    const query = {};

    if (pin) {
      query.PIN = { $regex: new RegExp(pin, "i") };
    }

    if (address) {
      query.address = { $regex: new RegExp(address, "i") };
    }

    const clinics = await ClinicModel.find(query)
      .sort({ clinicName: 1 })
      .limit(limit);

    if (clinics.length) {
      return res.status(200).send({ clinics });
    } else {
      return res.status(404).send({ message: `No clinics found matching the provided information.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An internal server error occurred.' });
  }
};

const displayByDoctorName = async (req, res) => {
  try {
    const { doctorName } = req.query;

    // Find the doctor's clinic IDs
    const doctor = await DoctorModel.findOne({ name: doctorName }, { clinicIds: 1 });

    if (!doctor) {
      res.status(404).send({ message: 'Doctor not found.' });
      return;
    }

    // Find clinics matching the doctor's clinic IDs
    const clinics = await ClinicModel.find({
      _id: { $in: doctor.clinicIds }
    })
      .select('clinicName');

    if (clinics.length) {
      res.status(200).send({ clinics });
    } else {
      res.status(404).send({ message: 'No clinics found for the specified doctor.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An internal server error occurred.' });
  }
};

const searchClinics = async (req, res) => {
  const searchTerm = req.query.search;
  console.log(req.query);
  // searchTerm = searchTerm.toString()
  console.log(searchTerm); // Get the search term from the query parameter

  try {
    // Search in both doctors and clinics collections
    const doctorMatches = await DoctorModel.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive name search
        { specialization: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    const clinicMatches = await ClinicModel.find({
      $or: [
        { clinicName: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive clinic name search
        { address: { $regex: searchTerm, $options: 'i' } },
        { specialists: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    // Combine results and format for response
    const results = [];

    for (const doctor of doctorMatches) {
      const clinics = await ClinicModel.find({ _id: { $in: doctor.clinicIds } });
      results.push({
        type: 'doctor',
        data: doctor,
        clinics
      });
    }

    results.push(...clinicMatches.map(clinic => ({ type: 'clinic', data: clinic })));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { addClinic, displayClinics, displayBySpecialists, displayByLocality, displayByDoctorName, searchClinics }


// {
//   "clinicName": "Khan Clinic",
//   "address": "123 Main St, Anytown, CA 12345",
//   "directionUrl": "https://maps.app.goo.gl/12345",
//   "specialists": ["Cardiologist", "Dermatologist", "General Practitioner"],
//   "phoneNumber": "9832582343",
//   "doctors": [
//     {
//       "_id": "5e4d909c68947f1444381245", // Doctor's ID
//       "daysAvailable": ["Monday", "Wednesday", "Friday"],
//       "timings": [
//         {
//           "day": "Monday",
//           "startTime": "09:00:00",
//           "endTime": "17:00:00"
//         },
//         {
//           "day": "Wednesday",
//           "startTime": "10:00:00",
//           "endTime": "15:00:00"
//         },
//         {
//           "day": "Friday",
//           "startTime": "12:00:00",
//           "endTime": "18:00:00"
//         }
//       ],
//       "fees": 50
//     }
//   ],
//   "images": null
// }
