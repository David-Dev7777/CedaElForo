import he from 'he'

export function decodeJsonStrings(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? he.decode(obj) : obj
  }
  if (Array.isArray(obj)) {
    return obj.map(item => decodeJsonStrings(item))
  }
  const newObj = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = decodeJsonStrings(obj[key])
    }
  }
  return newObj
}