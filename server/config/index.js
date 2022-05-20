require('dotenv').config()

const { PORT, MONGO_URL, FRONTEND } = process.env

module.exports = {
  port: PORT,
  mongo_url: MONGO_URL,
  frontend: FRONTEND,
}
