const { parseObject, parseJSONString, parseJSONFile } = require("./lib/parse")
const { addCustomFunction } = require("./lib/valueMap")

function generate(spec, n = 100) {
  if (typeof spec === "undefined") {
    throw Error("spec argument is required")
  }
  let generator
  if (typeof spec === "object") {
    generator = parseObject(spec)
  }
  if (typeof spec === "string") {
    if (spec.startsWith("{")) {
      generator = parseJSONString(spec)
    } else {
      generator = parseJSONFile(spec)
    }
  }
  if (typeof generator === "undefined") {
    throw Error(`spec argument must be either a string or an object. It is ${typeof spec}`)
  }
  const datapoints = new Array(n)
  for (let i = 0; i < n; i++) {
    datapoints[i] = generator()
  }
  return datapoints
}

module.exports = {
  generate,
  addCustomFunction,
}