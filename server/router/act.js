const { Router } = require('express')
const ActController = require('../controller/ActController')

const router = new Router()

router.get('/', ActController.getAll)
router.post('/', ActController.create)
router.put('/:id', ActController.update)
router.delete('/:id', ActController.delete)

module.exports = router
