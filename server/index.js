const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

//utils
const Logger = require('./utils/Logger')

//config
const config = require('./config/index')

//routes
const directory = require('./router/directory')
const edition = require('./router/edition')
const pricelist = require('./router/priceList')

//middleware
const errorMiddleware = require('./middleware/error-middleware')

const app = express()
app.use(
  cors({
    origin: config.frontend,
  })
)
app.use(express.json())

//routes
app.use('/api/directory', directory)
app.use('/api/edition', edition)
app.use('/api/pricelist', pricelist)

//middleware
app.use(errorMiddleware)

app.listen(config.port, async () => {
  try {
    await mongoose.connect(config.mongo_url)
  } catch (error) {
    Logger.log('ERROR', 'Ошибка при подключении к базе')
  }
  console.log(`successfully connected to mongoDb ${config.mongo_url}`)

  console.log(`app started on port ${config.port}`)
})
