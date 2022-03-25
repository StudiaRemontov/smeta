const { Router } = require('express')
const SubcategoryController = require('../controller/SubcategoryController')

const router = new Router()

router.get('/', SubcategoryController.getAll)
router.post('/', SubcategoryController.create)
router.put('/:id', SubcategoryController.update)
router.delete('/:id', SubcategoryController.delete)

module.exports = router
