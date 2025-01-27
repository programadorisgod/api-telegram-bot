export {}

declare global {
  interface String {
    isToEquals(str: string): boolean
  }
}

String.prototype.isToEquals = function (str: string): boolean {
  if (typeof str !== 'string') {
    throw Error(`error when comparing the string type with ${typeof str}`)
  }

  return this.toString().toLowerCase() === str.toLowerCase()
}
