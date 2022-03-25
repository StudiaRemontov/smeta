const { Router } = require('express')
const RoomTypeController = require('../controller/RoomTypeController')
const RoomTypeValidator = require('../validators/roomType-validator')

const router = new Router()

router.get('/', RoomTypeController.getAll)
router.post('/', RoomTypeController.create)
router.put('/:id', RoomTypeController.update)
router.delete(
  '/:id',
  RoomTypeValidator.checkCategories,
  RoomTypeController.delete
)

module.exports = router
