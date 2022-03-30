import { updatableMutations } from '../mutations/directory'

const createAutoUpdatePlugin = store => {
  const arrayOfTypes = Object.values(updatableMutations)

  store.subscribe(mutation => {
    const mutationType = mutation.type.split('/')[1]
    if (arrayOfTypes.includes(mutationType)) {
      const rootDir = store.getters['directory/parent']
      store.dispatch('directory/updateDirectory', rootDir)
    }
  })
}

export default createAutoUpdatePlugin
