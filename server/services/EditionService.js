const Edition = require('../models/Edition')
const PriceList = require('../models/PriceList')
const ApiError = require('../utils/ApiError')

const updateNodeInTree = (node, nodeKey, order) => {
  const { key, children } = node
  if (key === nodeKey && children && children.length > 0) {
    const exists = order.filter((key) => children.find((n) => n.key === key))
    const notExists = children.filter((n) => !order.includes(n.key + ''))
    const ordered = exists.map((k) => children.find((n) => n.key === k))

    const newChildren = [...ordered, ...notExists]
    node.children = newChildren
    return node
  }
  if (children && children.length > 0) {
    node.children = children.map((c) => updateNodeInTree(c, nodeKey, order))
  }
  return node
}

class EditionService {
  static async get() {
    return await Edition.find().lean()
  }

  static async getById(id) {
    const edition = await Edition.findById(id)

    if (!edition) {
      throw ApiError.BadRequest('Edition not found')
    }

    return edition
  }

  static async create(data) {
    const edition = new Edition({ ...data })
    await edition.save()
    return edition
  }

  static async update(id, data) {
    const edition = await Edition.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!edition) {
      throw ApiError.BadRequest('Edition not found')
    }

    return edition
  }

  static async setActive(id) {
    const edition = await EditionService.update(id, {
      active: true,
    })
    const priceList = await PriceList.findOne({ editions: id })
    const editions = priceList.editions.filter((eId) => eId + '' !== id)
    for (const edition of editions) {
      await EditionService.update(edition, {
        active: false,
      })
    }
    return edition
  }

  static async delete(id) {
    const edition = await Edition.findByIdAndDelete(id)
    if (!edition) {
      throw ApiError.BadRequest('Edition not found')
    }
    return edition
  }

  static async getEditionsByDirectoryIdAndUpdate(dirId, children) {
    const editions = await EditionService.get()
    const editionsToUpdate = await Promise.all(
      editions.map(async (edition) => {
        const { data: root, _id: id } = edition
        edition.data = updateNodeInTree(root, dirId, children)
        return await EditionService.update(id, edition)
      })
    )
    return editionsToUpdate
  }
}

module.exports = EditionService
