const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const db = require('./MongoConnect')
// const UserController = require('./UserController')
const UserModel = require('./Models/UserModel')

const app = express()
app.use(express.json()) 
app.use(cors())

const PORT = process.env.PORT || 9000

app.get('/', (req, res)=>{
    res.send({"msg": "Connection Successful!"})
})

app.post("/signup", async (req, res) => {
    console.log(req.body)
  const fName = req.body.fName;
  const lName = req.body.lName;
  const dob = req.body.dob;
  const add = req.body.address;
  const pin = req.body.pin;
  const mail = req.body.email;
  const ph = req.body.phNumber;
  const pass = req.body.password;

  const email = await UserModel.findOne({ "email": mail })
  .then((data) =>{
    console.log(data)
  })
  const phno = await UserModel.findOne({"phoneNumber": ph})
  .then((data)=>{
    console.log(data)
     if (email || data) {
        res.status(409).json({ error: "Account already exists!" });
    }else{
        const newClient = new UserModel({
                firstName: fName,
                lastName: lName,
                dateOfBirth: dob,
                height: 0,
                weight: 0,
                address: add,
                pincode: pin,
                email: mail,
                phoneNumber: ph,
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
    }})
  })

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}...`)
})