export const formatNumber = number => {
  const isInt = Number(number) === number && number % 1 === 0
  if (isInt) {
    return (
      number?.toLocaleString('ru', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) || 'Ошибка'
    )
  }
  return (
    number?.toLocaleString('ru', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || 'Ошибка'
  )
}
