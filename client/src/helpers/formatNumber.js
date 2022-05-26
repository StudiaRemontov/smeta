export const formatNumber = number => {
  return (
    number?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || 'Ошибка'
  )
}
