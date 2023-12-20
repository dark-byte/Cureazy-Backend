const mongoose = require('mongoose')
const DoctorModel = require('../Models/DoctorModel')

const addDoctor = async (req, res) => {
    console.log("Request body:", req.body);
    const { name, qualification, yearsOfExperience, description, phoneNumber } = req.body;

    if (!name || !qualification || !yearsOfExperience || !description) {
        return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const existingDoctor = await DoctorModel.findOne({ phoneNumber });
    if (existingDoctor) {
        return res.status(400).json({ error: "Doctor already exists." });
    }

    const newDoctor = new DoctorModel({
        name,
        qualification,
        yearsOfExperience,
        description,
        phoneNumber
    });

    try {
        await newDoctor.save();
        console.log("New doctor added:", newDoctor);
        return res.status(200).json({ message: "Doctor added successfully." });
    } catch (error) {
        console.error("Error adding doctor:", error);
        return res.status(500).json({ error: "An error occurred. Please try again later." });
    }
}

module.exports = { addDoctor } 

// {
//     "name": "Rajesh Verma",
//     "qualification": "MBBS",
//     "yearsOfExperience":10,
//     "description": "Cardiologist",
//     "phoneNumber":"9847023812"
// }