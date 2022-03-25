class Logger {
  static log(type, shortMessage) {
    const date = new Date()
    const data = {
      type,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      shortMessage,
    }

    console.log(data)
  }
}

module.exports = Logger
