function normalizedWeightsCumSum(weights) {
  if (!Array.isArray(weights)) {
    throw Error("Weights is not an array")
  }
  if (weights.length === 0) {
    throw Error("Weights is empty")
  }
  if (weights.some(val => val <= 0)) {
    throw Error("Nonpositive weights are not allowed")
  }
  const sum = weights.reduce((acc, newVal) => acc + newVal)
  const normWeights = weights.map((w) => w/sum)
  let acc = 0
  const cumSum = new Array(normWeights.length)
  for (let i = 0; i < normWeights.length; i++) {
    acc += normWeights[i]
    cumSum[i] = acc
  }
  return cumSum
}

module.exports = {
  normalizedWeightsCumSum,
}