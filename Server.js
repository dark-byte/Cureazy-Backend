const fs = require('fs')
const https = require('https')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const db = require('./MongoConnect')
const helmet = require('helmet')
const {signup, login, getUser} = require('./Controllers/UserController')
const UserModel = require('./Models/UserModel')
const DoctorModel = require('./Models/DoctorModel')
const ClinicModel = require('./Models/ClinicModel')
const auth = require('./Middleware/AuthMW')

const sgMail = require('@sendgrid/mail');

//Dummy Commit

const app = express()
app.use(express.json()) 
app.use(cors())

const PORT = process.env.PORT || 9000

app.use(helmet())

app.get('/', (req, res)=>{
    res.send({"msg": "Connection Successful!"})
})

app.get("/clinic/:id", (req, res)=>{
    res.send("Request received for id" + req.params.id)
    console.log(`Request for clinic - ${req.params.id}`)
});

app.post("/signup", signup)

app.post("/signup/google", async (req, res) => {
    console.log(req.body)
    const fName = req.body.fName;
    const lName = req.body.lName;
    const dob = req.body.dob;
    const add = req.body.address;
    const pin = req.body.pin;
    const mail = req.body.email;
    const ph = req.body.phNumber;
    const pass = req.body.password;

    var emailExists = false

    emailExists = await UserModel.findOne({ "email": mail })

    if (emailExists) {
        //Acount exists
        res.status(400).json({ error: "Account already exists!" });
        console.log("User Exists")
        console.log(`User Exists: \n${emailExists ? `Email: ${mail}` : `Phone Number: ${ph}`}`)
    } else {
        const newClient = new UserModel({
            firstName: fName,
            lastName: lName,
            dateOfBirth: dob,
            height: 0,
            weight: 0,
            address: add,
            pincode: pin,
            email: mail === "" ? "" : mail,
            phoneNumber: ph === "" ? "" : ph,
            password: pass
        });
        newClient.save()
            .then(savedUser => {
                console.log('New Client Added:', savedUser);
                res.status(200).json({ message: "Signup successful." });
            })
            .catch(error => {
                console.error('Error Creating Client: ', error);
                res.status(500).json({ error: "An error occurred. Please try again later." });
            });
    }
})

app.post("/login", login);


app.post("/login/google", async (req, res) => {
    const mail = req.body.email;

    const user = await UserModel.findOne({ "email": mail })
        .then((data) => {
            if (data) {
                console.log(`User ${data.email} logged in`)
                res.status(200).json({ message: "Login successful!" });
            } else {
                res.status(400).json({ error: "Email is incorrect!" });
            }
        })
        .catch(error => {
            console.error('Error Finding User: ', error);
            res.status(500).json({ error: "An error occurred. Please try again later." });
        });
});


app.post("/add-doctor", async (req, res) => {
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
  });
  
  // CDN
  // PUSH to git
  
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
  
  app.post('/add-clinic', async (req, res) => {
    try {
      const { clinicName, address, directionUrl, specialists, phoneNumber, doctors } = req.body;
  
      const existingClinic = await ClinicModel.findOne({ phoneNumber });
  
      if (existingClinic) {
        return res.status(409).send({ message: 'Clinic with the phone number already exists.' });
      }
  
      if (!clinicName || typeof clinicName !== 'string') {
        return res.status(400).send({ message: 'Clinic name is required and must be a string.' });
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
  });


https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}...`)
})
