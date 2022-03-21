const { Router } = require('express')
const RoomTypeController = require('../controller/RoomTypeController')

const router = new Router()

router.get('/', RoomTypeController.getAll)
router.post('/', RoomTypeController.create)

module.exports = router
