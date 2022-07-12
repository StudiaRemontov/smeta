const Status = require('./models/Status')

const getDate = (status) => {
  const { startedAt } = status
  const dateObj = new Date(startedAt)
  const date = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj)
  return date
}

async function start() {
  const docLength = await Status.countDocuments({})
  if (!docLength) {
    const newStatus = await Status.create({})
    return getDate(newStatus)
  }

  const status = await Status.findOneAndUpdate(
    {},
    { startedAt: new Date() },
    {
      new: true,
    }
  )
  return getDate(status)
}

module.exports = start
