const fs = require("fs")
const { valueMap } = require("./valueMap")
const Joi = require("joi")

const reservedKeys = [
  "$subspec", "$subSpec",
  "$array",
  "$length"
]

const arrayLengthSchema = Joi.number().integer().min(1).required()

function parseJSONFile(path) {
  const jsonString = fs.readFileSync(path).toString()
  return parseJSONString(jsonString)
}

function parseJSONString(jsonString) {
  const spec = JSON.parse(jsonString)
  return parseObject(spec)
}

function parseObject(specification) {
  if (typeof specification !== "object") {
    throw Error("Argument specification is undefined or not an object")
  }
  if (Object.keys(specification).length === 0) {
    throw Error("Argument specification is an empty object")
  }

  const generatorList = Object.entries(specification)
    // .filter((kv) => !(kv[0] === "subspec" || kv[0] === "subSpec"))
    .filter((kv) => !(reservedKeys.includes(kv[0])))
    .map((kv) => {
      const [key, spec] = kv
      if (spec.$array) {
        const n = spec.$length
        if (typeof n !== "number" || !Number.isInteger(n) || n < 1) {
          throw Error(`Spec ${key} has $array field. Requires accompanying $length field to be an integer >= 1`)
        }
        return [key, arrayWrapper(spec, n)]
      }
      if (spec.$subSpec ||
        spec.$subspec ||
        typeof spec.type === "undefined" ||
        typeof spec.type === "object") {
        return [key, parseObject(spec)]
      }
      return [key, valueMap(spec)]
    })

  return () => {
    const obj = {}
    generatorList.forEach((kv) => {
      const [key, generator] = kv
      obj[key] = generator()
    })
    return obj
  }
}

function arrayWrapper(spec, n) {
  console.log("Called arrayWrapper")
  let gen
  if (spec.$subSpec ||
    spec.$subspec ||
    typeof spec.type === "undefined" ||
    typeof spec.type === "object") {
    gen = parseObject(spec)
  } else {
    gen = valueMap(spec)
  }
  return () => {
    const arr = new Array(n)
    for (let i = 0; i < n; i++) {
      arr[i] = gen()
    }
    return arr
  }
}

module.exports = {
  parseObject,
  parseJSONFile,
  parseJSONString,
}
