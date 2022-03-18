const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require('./config/index')

const app = express()
app.use(cors)
app.use(bodyParser.json())

app.listen(8000, async () => {
  await mongoose.connect(config.mongoDB)
  console.log('connected to MongoDB')

  console.log(`app started on port ${8000}`)
})
