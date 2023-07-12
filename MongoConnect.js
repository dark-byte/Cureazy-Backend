const mongoose = require('mongoose')
const UserModel = require('./Models/UserModel')
const dotenv = require('dotenv')

const MONGO_URL = process.env.MONGO_URL

const connect = async ()=>{
    
    const con = await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

mongoose.connection.once('open',()=>{
    console.log("Connection Ready!")
})

mongoose.connection.on('error', (err)=>{
    console.error(err)
})

module.exports = UserModel.db