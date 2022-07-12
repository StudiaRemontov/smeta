const { Router } = require('express')
const StatusController = require('../controller/StatusController')

const router = new Router()

router.get('/', StatusController.get)

module.exports = router
