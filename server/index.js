const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

//config
const config = require('./config/index')

//routes
const subcategory = require('./router/subcategory')
const category = require('./router/category')
const roomtype = require('./router/roomType')
const estimate = require('./router/estimate')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api/subcategory', subcategory)
app.use('/api/category', category)
app.use('/api/roomtype', roomtype)
app.use('/api/estimate', estimate)

app.listen(config.port, async () => {
  await mongoose.connect(config.mongoDB)
  console.log('connected to MongoDB')

  console.log(`app started on port ${config.port}`)
})
