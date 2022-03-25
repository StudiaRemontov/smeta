const { Router } = require('express')
const CategoryController = require('../controller/CategoryController')

const router = new Router()

router.get('/', CategoryController.getAll)
router.post('/', CategoryController.create)
router.put('/:id', CategoryController.update)
router.delete('/:id', CategoryController.delete)

module.exports = router
