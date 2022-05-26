import { isObjectId } from './isObjectId'

export const getAllValues = node => {
  const { children, key } = node
  const childs = children.map(getAllValues).flat()
  if (isObjectId(key)) {
    return childs
  }
  return [node]
}
