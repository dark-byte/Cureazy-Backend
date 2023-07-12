const mongoose = require('mongoose')
const UserModel = require('./Models/UserModel')

const signup = (req, res)=>{
    const fName = req.body.fName;
    const lName = req.body.lName;
    const dob = req.body.dob;
    const add = req.body.address;
    const pin = req.body.pin;
    const mail = req.body.email;
    const ph = req.body.phNumber;
    const pass = req.body.password;

    UserModel.findOne({ "email": mail }).then((foundEmail)=>{{
        if (err) {
        console.log(err);
        res.status(500).json({ error: "An error occurred. Please try again later." });
        } 

        if (foundEmail) {
            res.status(409).json({ error: "Email already exists!" });
        }  

        Client.findOne({ "phoneNumber": ph }, (err, foundPhone) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "An error occurred. Please try again later." });
        }

        if (foundPhone) {
        res.status(409).json({ error: "Phone number already exists!" });
        } else {
            const newClient = new Client({
            firstName: fName,
            lastName: lName,
            dateOfBirth: dob,
            height: 0,
            weight: 0,
            address: add,
            pincode: pin,
            email: mail,
            phoneNumber: ph,
            password: pass,
            password2: pass2
            });

            newClient.save()
            .then(savedUser => {
                console.log('New User Added:', savedUser);
                res.status(200).json({ message: "Signup successful." });
            })
            .catch(error => {
                console.error('Error Registering User: ', error);
                res.status(500).json({ error: "An error occurred. Please try again later." });
            });
            
        }
        });
    
    
    }});
}


module.exports = { signup } 