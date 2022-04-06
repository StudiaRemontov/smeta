const { Router } = require('express')
const PriceListController = require('../controller/PriceListController')

const router = new Router()

router.get('/', PriceListController.getAll)
router.post('/', PriceListController.create)
router.put('/:id', PriceListController.update)
router.delete('/:id', PriceListController.delete)

module.exports = router
