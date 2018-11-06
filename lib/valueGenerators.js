const chance = require("chance").Chance()
const Joi = require("joi")

const { normalizedWeightsCumSum } = require("./utils")

function int(min = 0, max = 100) {
  if (min >= max) {
    console.warn(`Invalid min-max range ${min}-${max}. Defaulting to 0-100`)
    min = 0
    max = 100
  }
  const config = { min, max }
  return () => chance.integer(config)
}

function float(min = 0, max = 1, digitsaftercomma = 2) {
  if (min >= max) {
    console.warn(`Invalid min-max range ${min}-${max}. Defaulting to 0-1`)
    min = 0
    max = 1
  }
  if (digitsaftercomma < 1) {
    console.warn("Invalid value for digits after comma. Defaulting to 2")
    digitsaftercomma = 2
  }
  const config = {
    min, max
  }
  if (digitsaftercomma !== 4) {
    config.fixed = digitsaftercomma
  }
  return () => chance.floating(config)
}

function bool(trueProbability = 0.5) {
  if (trueProbability === 0 || trueProbability === 1) {
    console.warn(`Probability ${trueProbability} for boolean=true will yield constant value ${trueProbability === 1}`)
    return constant(trueProbability === 1)
  }
  if (trueProbability < 0 || trueProbability > 1) {
    console.warn(`Invalid probability for boolean=true ${trueProbability}. Defaults to 0.5`)
    return () => chance.bool()
  }
  const likelihood = trueProbability * 100
  return () => chance.bool({ likelihood })
}

const constantAllowedTypes = ["string", "number", "boolean"]
function constant(value) {
  if (constantAllowedTypes.includes(typeof value)) {
    return () => value
  }
  console.warn("Constant value only allows string, number or boolean for now. Defaults to string \"CONSTANT\"")
  return () => "CONSTANT"
}

function nominal(spec) {
  let n
  if (typeof spec === "undefined") {
    n = 3
  } else if (typeof spec === "number") {
    n = spec
  } else if (typeof spec.n === "number") {
    n = spec.n
  } else {
    throw Error("Invalid argument to spec. Please supply either a number or a config-object with a number field named n")
  }
  if (n === 1) {
    console.warn("Nominal is set to 1 option. Will yield constant value")
    return constant(chance.animal())
  }
  if (n < 1) {
    console.warn(`Invalid number of options for Nominal, ${n}. Defaults to 3`)
    n = 3
  }
  const choices = []
  for (let i = 0; i < n; i++) {
    choices.push(chance.animal())
  }
  const config = { min: 0, max: n-1}
  return () => {
    const i = chance.integer(config)
    return choices[i]
  }
}

const selectSchema = Joi.object().keys({
  values: Joi.array().items(Joi.string(), Joi.number()).min(1),
  n: Joi.number().integer().min(1),
  weights: Joi.array().items(Joi.number()).min(1)
}).xor("values", "n")
function select(spec) {
  const res = Joi.validate(spec, selectSchema)
  if (res.error) {
    throw res.error
  }
  const { values, n, weights } = res.value
  let options = []
  if (typeof values !== "undefined") {
    if (values.length === 1) {
      console.warn("Select n is set to 1. Will yield constant value")
      return constant(values[0])
    }
    options = values
  } else {
    if (n === 1) {
      console.warn("Select n is set to 1. Will yield constant value")
      return constant(chance.animal())
    }
    for (let i = 0; i < n; i++) {
      options.push(chance.animal())
    }
  }

  if (typeof weights === "undefined") {
    const config = { min: 0, max: options.length - 1 }
    return () => {
      const i = chance.integer(config)
      return options[i]
    }
  }

  if (weights.length !== options.length) {
    throw Error(`Number of weights ${weights.length} is not the same as number of options ${options.length}`)
  }

  const normCumSum = normalizedWeightsCumSum(weights)
  return () => {
    const x = Math.random()
    let i = 0
    while (x >= normCumSum[i]) {
      i++
    }
    return options[i]
  }
}

const countSchema = Joi.object().keys({
  start: Joi.number().integer().default(0),
  end: Joi.number().integer().greater(Joi.ref("start"))
})
function count(spec) {
  const res = Joi.validate(spec, countSchema)
  if (res.error) {
    throw res.error
  }
  const { start, end } = res.value
  let i = start
  if (typeof end === "undefined") {
    return () => {
      const val = i
      i = i + 1
      return val
    }
  }
  return () => {
    const val = i
    i = (i + 1 > end) ? start : i + 1
    return val
  }
}

const loopSchema = Joi.object().keys({
  values: Joi.array().items(Joi.number(), Joi.string(), Joi.boolean()).min(1).required()
})
function loop(spec) {
  const res = Joi.validate(spec, loopSchema)
  if (res.error) {
    throw res.error
  }
  const { values } = res.value
  if (values.length === 1) {
    console.warn("Only one value in values. Returns constant value")
    return constant(values[0])
  }
  let i = 0
  const length = values.length
  return () => {
    const val = values[i]
    i = (i + 1) % length
    return val
  }
}

function id() {
  return () => chance.guid()
}

module.exports = {
  int,
  float,
  bool,
  constant,
  nominal,
  select,
  count,
  loop,
  id,
}
