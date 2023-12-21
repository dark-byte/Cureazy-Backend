const mongoose = require('mongoose')
const UserModel = require('../Models/UserModel')
const jtw = require('jsonwebtoken')

const signup = async (req, res)=>{
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
    var phExists = false

    if(ph === "" || (ph != "" && mail != "")){
        emailExists = await UserModel.findOne({ "email": mail })
        //isEmail is only used to check if account with given email exists when ph is empty string - ""
    } else if(mail === ""){
        phExists = await UserModel.findOne({"phoneNumber": ph})
        //isPh is only used to check if account with given phone number exists when email is empty string - ""
    } 
    
    if(emailExists || phExists) {
        //Acount exists
            res.status(400).json({ error: "Account already exists!" });
            console.log("User Exists")
            console.log(`User Exists: \n${emailExists? `Email: ${mail}`: `Phone Number: ${ph}`}`)
    }else{
        const newClient = new UserModel({
                firstName: fName,
                lastName: lName,
                dateOfBirth: dob,
                height: 0,
                weight: 0,
                address: add,
                pincode: pin,
                email: mail === "" ? "": mail,
                phoneNumber: ph === "" ? "" : ph,
                password: pass
            });
            newClient.save()
                .then(savedUser => {
                    console.log('New Client Added:', savedUser);
                    res.status(200).json({ message: "Signup successful.",
                    token: generateJWTToken(savedUser._id) 
                });
                })
                .catch(error => {
                    console.error('Error Creating Client: ', error);
                    res.status(500).json({ error: "An error occurred. Please try again later." });
                });
    }
}

const login = async(req, res)=>{
    const mail = req.body.email;
    const pass = req.body.password;

    await UserModel.findOne({ "email": mail })
        .then((data) => {
            if (data) {
                if (data.password === pass) {
                    console.log(`User ${data.email} logged in`)
                    res.status(200).json({ 
                        message: "Login successful!",
                        token: generateJWTToken(data._id)
                    })
                } else {
                    res.status(400).json({ error: "Password is incorrect!" });
                }
            } else {
                res.status(400).json({ error: "Email is incorrect!" });
            }
        })
        .catch(error => {
            console.error('Error Finding User: ', error);
            res.status(500).json({ error: "An error occurred. Please try again later." });
        });
}

const signupGoogle = async (req, res)=>{
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
}

const loginGoogle = async (req, res)=>{
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
}

const getUser = async(req, res)=>{
    const user = UserModel.findById()
}

const generateJWTToken = (id)=>{
    return jtw.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = { signup, login, signupGoogle, loginGoogle } 