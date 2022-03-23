class Logger {
  static log(type, shortMessage) {
    const date = new Date()
    const data = {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      type,
      shortMessage,
    }

    console.log(data)
  }
}

module.exports = Logger
