require('dotenv').config()

const { PORT, mongoDB } = process.env

module.exports = {
  port: PORT,
  mongoDB: mongoDB,
}
