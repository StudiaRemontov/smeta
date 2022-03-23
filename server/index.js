const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

//utils
const logger = require('./utils/logger')

//config
const config = require('./config/index')

//routes
const subcategory = require('./router/subcategory')
const category = require('./router/category')
const roomtype = require('./router/roomType')
const estimate = require('./router/estimate')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/subcategory', subcategory)
app.use('/api/category', category)
app.use('/api/roomtype', roomtype)
app.use('/api/estimate', estimate)

app.use((err, req, res, next) => {
  logger.log('ERROR', err.message)
  res.status(400).json({ message: err.message })
})

app.listen(config.port, async () => {
  try {
    await mongoose.connect(config.mongoDB)
  } catch (error) {
    logger.log('ERROR', 'Ошибка при подключении к базе')
  }
  console.log(`successfully connected to mongoDb ${config.mongoDB}`)

  console.log(`app started on port ${config.port}`)
})
