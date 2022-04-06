const { Router } = require('express')
const DirectoryController = require('../controller/DirectoryController')

const router = new Router()

router.get('/', DirectoryController.getAll)
router.post('/', DirectoryController.create)
router.put('/:id', DirectoryController.update)
router.delete('/:id', DirectoryController.delete)

module.exports = router