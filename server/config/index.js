require('dotenv').config()

const { PORT, MONGO_URL, FRONTEND, NODE_ENV } = process.env

module.exports = {
  port: PORT,
  mongo_url: MONGO_URL,
  frontend: FRONTEND,
  IS_PRODUCTION: NODE_ENV === 'production'
}
