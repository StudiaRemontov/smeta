require('dotenv').config()

const { PORT, MONGO_URL, FRONTEND, NODE_ENV } = process.env

module.exports = {
  PORT,
  MONGO_URL,
  FRONTEND,
  IS_PRODUCTION: NODE_ENV === 'production',
}
