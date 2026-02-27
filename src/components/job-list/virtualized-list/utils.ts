export const findFirstOffsetIndex = (offsets: number[], value: number): number => {
  let low = 0
  let high = offsets.length - 1

  while (low < high) {
    const middle = Math.floor((low + high + 1) / 2)
    if (offsets[middle] <= value) {
      low = middle
    } else {
      high = middle - 1
    }
  }

  return low
}
