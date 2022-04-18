const { Router } = require('express')
const EditionController = require('../controller/EditionController')

const router = new Router()

router.get('/', EditionController.getAll)
router.post('/', EditionController.create)
router.put('/:id', EditionController.update)
router.patch('/:id/active', EditionController.setActive)
router.delete('/:id', EditionController.delete)

module.exports = router
