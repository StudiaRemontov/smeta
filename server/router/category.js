const { Router } = require('express')
const CategoryController = require('../controller/CategoryController')

const router = new Router()

router.get('/', CategoryController.getAll)
router.post('/', CategoryController.create)

module.exports = router
