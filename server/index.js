const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

//utils
const Logger = require('./utils/logger')

//config
const config = require('./config/index')

//routes
const directory = require('./router/directory')
const edition = require('./router/edition')
const pricelist = require('./router/priceList')
const outlay = require('./router/outlay')

//middleware
const errorMiddleware = require('./middleware/error-middleware')

const app = express()

if (config.IS_PRODUCTION) {
  const serveStatic = require('serve-static')
  const history = require('connect-history-api-fallback')

  app.use(history())
  app.use(serveStatic(path.join(__dirname, 'client')))
}

if (!config.IS_PRODUCTION) {
  const corsOptions = {
    origin: config.FRONTEND,
  }

  app.use(cors(corsOptions))
}
app.use(express.json())

//routes
app.use('/api/directory', directory)
app.use('/api/edition', edition)
app.use('/api/pricelist', pricelist)
app.use('/api/outlay', outlay)
app.use('/pdf', express.static(__dirname + '/pdf'))

//middleware
app.use(errorMiddleware)

app.listen(config.PORT, async () => {
  try {
    await mongoose.connect(config.MONGO_URL)
  } catch (error) {
    Logger.log('ERROR', 'Ошибка при подключении к базе')
  }
  console.log(`successfully connected to mongoDb ${config.MONGO_URL}`)

  console.log(`app started on port ${config.PORT}`)
})
