const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./MongoConnect')

const app = express()
app.use(express.json()) 
app.use(cors())
dotenv.config()

const PORT = process.env.PORT || 9000

app.get('/', (req, res)=>{
    res.send({"msg": "Connection Successful!"})
})


app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}...`)
})