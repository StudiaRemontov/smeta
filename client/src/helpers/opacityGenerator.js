export const opacityGenerator = quantity => {
  const minPercent = 0.2
  const maxPercent = 1
  const opacityZone = maxPercent - minPercent
  const opacitiyStep = opacityZone / quantity
  return new Array(quantity).fill(0).map((_, index) => {
    const opacity = maxPercent - index * opacitiyStep
    return opacity
  })
}
