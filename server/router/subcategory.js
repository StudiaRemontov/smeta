const { Router } = require('express')
const SubcategoryController = require('../controller/SubcategoryController')
const SubcategoryValidator = require('../validators/subcategory-validator')

const router = new Router()

router.get('/', SubcategoryController.getAll)
router.post('/', SubcategoryController.create)
router.put('/:id', SubcategoryController.update)
router.delete(
  '/:id',
  SubcategoryValidator.checkJobs,
  SubcategoryController.delete
)

module.exports = router
