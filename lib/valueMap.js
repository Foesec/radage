const generators = require("./valueGenerators")

const SELECTOR_NAME = "type"

const basicGenerators = [
  "int", "integer",
  "float",
  "bool", "boolean",
  "constant",
]

const mapping = {
  "select": generators.select,
  "nominal": generators.nominal,
  "count": generators.count,
  "loop": generators.loop,
  "id": generators.id
}

function valueMap(valueSpec) {
  if (typeof valueSpec !== "object") {
    throw Error("argument valueSpec is not an object!")
  }
  const selector = valueSpec[SELECTOR_NAME]
  if (typeof selector !== "string") {
    throw Error(`Field ${SELECTOR_NAME} of valueSpec is not a string!`)
  }
  const sel = selector.toLowerCase()
  switch (sel) {
  case "int":
  case "integer":
    return generators.int(valueSpec.min, valueSpec.max)
  case "float":
    return generators.float(valueSpec.min, valueSpec.max, valueSpec.digitsAfterComma)
  case "bool":
  case "boolean":
    return generators.bool(valueSpec.probability || valueSpec.trueProbability)
  case "constant":
    return generators.constant(valueSpec.value)
  }
  const fn = mapping[sel.toLowerCase()]
  if (typeof fn === "undefined") {
    throw Error(`Unknown generator type ${sel}`)
  }
  delete valueSpec.type
  return fn(valueSpec)
}

function addCustomFunction(name, fn) {
  if (typeof name !== "string") {
    throw Error("Argument name must be string")
  }
  if (typeof fn !== "function") {
    throw Error("Argument fn must be a function")
  }
  if (mapping.hasOwnProperty(name) || basicGenerators.includes(name)) {
    throw Error(`Generator function with name ${name} already exists`)
  }
  mapping[name] = fn
}

module.exports = {
  valueMap,
  addCustomFunction,
}
