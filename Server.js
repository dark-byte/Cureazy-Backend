const fs = require('fs')
const https = require('https')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv').config()
const db = require('./MongoConnect')
const helmet = require('helmet')
const { signup, login, getUser } = require('./Controllers/UserController')
const { addDoctor } = require('./Controllers/DoctorController')
const { addClinic, displayClinics, displayBySpecialists, displayByLocality } = require('./Controllers/ClinicController')
const UserModel = require('./Models/UserModel')
const auth = require('./Middleware/AuthMW')

const multer = require('multer');
const upload = multer({ dest: null });

const sgMail = require('@sendgrid/mail');

//Dummy Commit

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 9000

app.use(helmet())

app.get('/', (req, res) => {
    res.send({ "msg": "Connection Successful!" })
})

app.get("/clinic/:id", (req, res) => {
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


app.post("/add-doctor", addDoctor);

app.post('/add-clinic', addClinic);

app.get('/clinics', displayClinics);

app.get('/clinics/specialists', displayBySpecialists);

app.get('/clinics/locality', displayByLocality);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})