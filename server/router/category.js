const { Router } = require('express')
const CategoryController = require('../controller/CategoryController')
const CategoryValidator = require('../validators/category-validator')

const router = new Router()

router.get('/', CategoryController.getAll)
router.post('/', CategoryController.create)
router.put('/:id', CategoryController.update)
router.delete(
  '/:id',
  CategoryValidator.checkSubcategories,
  CategoryController.delete
)

module.exports = router
