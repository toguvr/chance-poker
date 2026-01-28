export const choose5of7 = (items: number) => {
  const combos: number[][] = []
  for (let a = 0; a < items - 4; a += 1) {
    for (let b = a + 1; b < items - 3; b += 1) {
      for (let c = b + 1; c < items - 2; c += 1) {
        for (let d = c + 1; d < items - 1; d += 1) {
          for (let e = d + 1; e < items; e += 1) {
            combos.push([a, b, c, d, e])
          }
        }
      }
    }
  }
  return combos
}

export const sample = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)]

export const removeAt = <T>(list: T[], index: number) => {
  list.splice(index, 1)
}

export const drawRandom = <T>(list: T[], count: number) => {
  const result: T[] = []
  for (let i = 0; i < count; i += 1) {
    const idx = Math.floor(Math.random() * list.length)
    result.push(list[idx])
    list.splice(idx, 1)
  }
  return result
}
