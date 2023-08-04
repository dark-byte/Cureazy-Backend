const fs = require('fs')
const https = require('https')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const db = require('./MongoConnect')
const helmet = require('helmet')
const {signup, login} = require('./Controllers/UserController')
const UserModel = require('./Models/UserModel')
const { signup } = require('./Controllers/UserController')

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

app.post("/login", login);


https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}...`)
})
