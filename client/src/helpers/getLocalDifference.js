const expiresTime = +import.meta.env.VITE_LOCAL_EXPIRES_TIME
//сравниваю локальные и серверные данные.
//метод возвразает объект с массивами: created, updated, removed.
//В этих массивах сметы, которые нужно создать/изменить/удалить т.е. отправить запрос на бек.
export default (server, local) => {
  const created = local.filter(localData => {
    //те, что не удалены локально
    if (localData.removedAt) {
      return false
    }
    //и те, которых нету на сервере
    const isExistsOnServer = server.find(
      serverData => serverData._id === localData._id,
    )
    //Если есть на сервере, значит не новая
    if (isExistsOnServer) {
      return false
    }
    //Проверяю устаревшие данные или нет
    const localUpdatedAt = new Date(localData.updatedAt).getTime()
    const now = Date.now()
    const diff = now - localUpdatedAt
    if (diff < expiresTime) {
      return true
    }
    console.warn('Удалены устаревшие данные')
    return false
  })
  //измененные
  const updated = local.filter(localData => {
    const serverData = server.find(s => s._id === localData._id)
    //те, то есть на севере
    if (!serverData) {
      return false
    }
    const serverUpdatedAt = new Date(serverData.updatedAt).getTime()
    const localUpdatedAt = new Date(localData.updatedAt).getTime()
    //если дата изменения локальной больше серверной, то она считается измененой
    return localUpdatedAt > serverUpdatedAt
  })
  //получаю все удаленный локальные сметы
  const removedData = local.filter(lo => lo.removedAt)

  const removed = removedData.filter(lo => {
    const serverData = server.find(so => so._id === lo._id)
    //проверяю есть ли на сервере. Если нету, то запрос на сервер отправлять не нужно.
    if (!serverData) {
      return false
    }
    const serverUpdatedAt = new Date(serverData.updatedAt).getTime()
    const localRemovedAt = new Date(lo.removedAt).getTime()
    return localRemovedAt > serverUpdatedAt
  })

  return {
    created,
    updated,
    removed,
  }
}
