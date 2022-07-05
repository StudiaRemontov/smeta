export const formatNumber = number => {
  return (
    number?.toLocaleString('ru', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || 'Ошибка'
  )
}
