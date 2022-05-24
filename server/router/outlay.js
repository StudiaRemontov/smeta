const { Router } = require('express')
const OutlayController = require('../controller/OutlayController')

const router = new Router()

router.get('/', OutlayController.getAll)
router.post('/', OutlayController.create)
router.put('/:id', OutlayController.update)
router.patch('/:id/active', OutlayController.setActive)
router.delete('/:id', OutlayController.delete)

module.exports = router
