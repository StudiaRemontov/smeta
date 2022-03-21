const { Router } = require('express')
const EstimateController = require('../controller/EstimateController')

const router = new Router()

router.get('/', EstimateController.getAll)
router.post('/', EstimateController.create)
router.put('/:id', EstimateController.update)

module.exports = router
