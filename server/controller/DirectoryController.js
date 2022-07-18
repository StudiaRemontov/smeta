const DirectoryService = require('../services/DirectoryService')
const EditionService = require('../services/EditionService')

class DirectoryController {
  static async getAll(req, res, next) {
    try {
      const response = await DirectoryService.get()
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body

      const newDirectory = await DirectoryService.create(data)
      const { parent, _id: newDirId } = newDirectory
      if (!parent) {
        return res.json({
          directory: newDirectory,
        })
      }
      const parentDirectory = await DirectoryService.getById(parent)
      parentDirectory.children.push(newDirId)
      const updatedParent = await DirectoryService.update(
        parentDirectory._id,
        parentDirectory
      )
      return res.json({
        directory: newDirectory,
        parent: updatedParent,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const response = await DirectoryService.update(id, data)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const id = req.params.id
      //получаю все внутриенние папки удаляемой папки и удаляю их
      const removedList = await DirectoryService.removeSubFolders(id)
      //удаляю удаляему папку
      const removedDirectory = await DirectoryService.delete(id)
      const { parent } = removedDirectory
      if (!parent) {
        return res.json({
          removed: [...removedList, removedDirectory],
        })
      }
      //получаю удаленную папку и родительскую папку
      const parentDirectory = await DirectoryService.getById(parent)
      const { children } = parentDirectory
      const newChildren = children.filter((child) => child._id + '' !== id)
      const updatedParent = await DirectoryService.update(parent, {
        children: newChildren,
      })
      //возвращаю удаленные папки и обновленную родительскую
      return res.json({
        removed: [...removedList, removedDirectory],
        updated: updatedParent,
      })
    } catch (error) {
      next(error)
    }
  }

  static async sort(req, res, next) {
    try {
      const id = req.params.id
      const data = req.body
      const directory = await DirectoryService.update(id, data)
      const { children } = directory

      const order = children.map((c) => c + '')

      const editionsToUpdate =
        await EditionService.getEditionsByDirectoryIdAndUpdate(id, order)
      return res.json({ directory, editionsToUpdate: editionsToUpdate })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

module.exports = DirectoryController
