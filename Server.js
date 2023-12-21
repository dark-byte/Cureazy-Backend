// SERVICES
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const db = require('./MongoConnect')
const helmet = require('helmet')
const multer = require('multer');

// CONTROLLERS
const { signup, login, signupGoogle, loginGoogle } = require('./Controllers/UserController')
const { addDoctor } = require('./Controllers/DoctorController')
const { addClinic, displayClinics, displayBySpecialists, displayByLocality } = require('./Controllers/ClinicController')


// OBJECT CREATIONS
const app = express()
const storage = multer.memoryStorage(); // You can also use diskStorage if you want to save files to disk
const upload = multer({ storage: storage });
const PORT = process.env.PORT || 9000

// APP.USE
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded requests
app.use(upload.any()); // Use multer to handle multipart/form-data
app.use(express.json())
app.use(cors())
app.use(helmet())


// ************ API ENDPOINTS ************ 


// GET

app.get('/', (req, res) => {
    res.send({ "msg": "Connection Successful!" })
})

app.get("/clinic/:id", (req, res) => {
    res.send("Request received for id" + req.params.id)
    console.log(`Request for clinic - ${req.params.id}`)
});


// POST

app.post("/signup", signup)

app.post("/signup/google", signupGoogle)

app.post("/login", login)

app.post("/login/google", loginGoogle)

app.post("/add-doctor", addDoctor);

app.post('/add-clinic', addClinic);

app.get('/clinics', displayClinics);

app.get('/clinics/specialists', displayBySpecialists);

app.get('/clinics/locality', displayByLocality);

// STARTING SERVER

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})