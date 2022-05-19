export const formatNumber = number => {
  return number.toLocaleString(undefined, { minimumFractionDigits: 2 })
}
