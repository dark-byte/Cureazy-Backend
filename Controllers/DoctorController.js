const DoctorModel = require('../Models/DoctorModel')
const uploadProfilePic = require('../Middleware/UploadProfilePic')

const addDoctor = async (req, res) => {
    console.log("Request body:", req.body);

    const {
        name,
        qualification,
        yearsOfExperience,
        description,
        phoneNumber,
        specialization,
        clinicIds
    } = req.body;

    if (!name || !qualification || !yearsOfExperience || !description || !specialization || !clinicIds) {
        return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const existingDoctor = await DoctorModel.findOne({ phoneNumber });
    if (existingDoctor) {
        return res.status(400).json({ error: "Doctor already exists." });
    }

    var secureUrl = "";

    if (req.body.profilePic) {
        secureUrl = await uploadProfilePic(req.body.profilePic);
    }

    const newDoctor = new DoctorModel({
        profilePic: secureUrl,
        name,
        qualification,
        yearsOfExperience,
        description,
        phoneNumber,
        specialization,
        clinicIds
    });

    try {
        await newDoctor.save();
        console.log("New doctor added:", newDoctor);
        return res.status(200).json({ message: "Doctor added successfully." });
    } catch (error) {
        console.error("Error adding doctor:", error);
        return res.status(500).json({ error: "An error occurred. Please try again later." });
    }
};

const getDoctorsBySpecialization = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const { specialization } = req.query;

        console.log(clinicId);
        console.log(specialization);

        const doctors = await DoctorModel.find({
            clinicIds: { $in: [clinicId] }, 
            specialization
        });

        if (doctors.length) {
            res.status(200).json({ doctors });
        } else {
            res.status(404).json({ message: 'No doctors found with the specified specialization in this clinic.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};





module.exports = { addDoctor, getDoctorsBySpecialization }

// {
//     "name": "Rajesh Verma",
//     "qualification": "MBBS",
//     "yearsOfExperience":10,
//     "description": "Cardiologist",
//     "phoneNumber":"9847023812"
// }

// {
//     "name": "Dr. John Doe",
//     "qualification": "MBBS, MD",
//     "rating": 4.5,
//     "yearsOfExperience": 15,
//     "description": "Experienced cardiologist with expertise in treating heart diseases.",
//     "phoneNumber": "9876543210",
//     "specialization": "Cardiologist",
//     "clinicIds": [
//       "657d89b5d908e21dda220fa9", // Replace with actual clinic IDs
//       "657d89ead908e21dda220faf"
//     ], // Array of clinic IDs
//     "profilePic": "https://example.com/doctor-profile.jpg" // Optional
//   }