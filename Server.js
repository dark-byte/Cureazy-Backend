const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const db = require('./MongoConnect')
// const UserController = require('./UserController')
const UserModel = require('./Models/UserModel')
const bcrypt = require('bcryptjs');

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID;

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 9000

app.get('/', (req, res) => {
    res.send({ "msg": "Connection Successful!" })
})

app.post("/signup", async (req, res) => {
    const saltRounds=10;

    const fName = req.body.fName;
    const lName = req.body.lName;
    const dob = req.body.dob;
    const add = req.body.address;
    const pin = req.body.pin;
    const mail = req.body.email;
    const ph = req.body.phNumber;

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const email = await UserModel.findOne({ "email": mail })
        .then((data) => {
            if(data){
                console.log("User with the same email already exists.");
                return data;
            }
        })
    const phno = await UserModel.findOne({ "phoneNumber": ph })
        .then((data) => {
            if (email || data) {
                if(data)
                    console.log("User with the same phone number already exists.");
                res.status(400).json({ error: "Account already exists!" });
            } else {
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
                    password: hashedPassword
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
})

app.post("/signup/google", async (req, res) => {
    const token = req.body.token;
    
    const client = new OAuth2Client(CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });
      
      const { given_name, family_name, email } = ticket.getPayload();
      
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Account already exists!" });
      }
      
      const newUser = new UserModel({
        firstName: given_name,
        lastName: family_name,
        email,
        password: '', 
      });
  
      await newUser.save();
      res.status(200).json({ message: "Google Sign-Up successful." });
    } catch (error) {
      console.error('Google Sign-Up Error: ', error);
      res.status(500).json({ error: "An error occurred. Please try again later." });
    }
  });
  

app.post("/login", async (req, res) => {
    const mail = req.body.email;
    const pass = req.body.password;

    const user = await UserModel.findOne({ "email": mail })
    .then((data) => {
        if (data) {
          const isPasswordValid = bcrypt.compareSync(pass, data.password);
          if (isPasswordValid) {
            res.status(200).json({ message: "Login successful." });
          } else {
            res.status(400).json({ error: "Password is incorrect." });
          }
        } else {
          res.status(400).json({ error: "Email doesn't match." });
        }
      })
        .catch(error => {
            console.error('Error Finding User: ', error);
            res.status(500).json({ error: "An error occurred. Please try again later." });
        });
});

app.post("/login/google", async (req, res) => {
    const token = req.body.token;
    
    const client = new OAuth2Client(CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });
      
      const { email } = ticket.getPayload();
      
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Email doesn't match." });
      }
      
      res.status(200).json({ message: "Google Login successful." });
    } catch (error) {
      console.error('Google Login Error: ', error);
      res.status(500).json({ error: "An error occurred. Please try again later." });
    }
  });
  

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})
