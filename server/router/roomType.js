const { Router } = require('express')
const RoomTypeController = require('../controller/RoomTypeController')

const router = new Router()

router.get('/', RoomTypeController.getAll)
router.post('/', RoomTypeController.create)
router.put('/:id', RoomTypeController.update)
router.delete('/:id', RoomTypeController.delete)

module.exports = router
