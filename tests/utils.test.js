const utils = require("../lib/utils")

describe("normalizedWeightsCumSum", () => {
  test("returns the correct values", () => {
    const inputs = [
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [1, 1, 2],
      [3, 1],
      [3, 3, 3, 3, 3],
      [0.3, 0.3, 0.2, 0.2]
    ]
    const results = [
      [0.25, 0.5, 0.75, 1],
      [0.25, 0.5, 0.75, 1],
      [0.25, 0.5, 1],
      [0.75, 1],
      [0.2, 0.4, 0.6, 0.8, 1],
      [0.3, 0.6, 0.8, 1]
    ]
    for (let i = 0; i < inputs.length; i++) {
      const expected = results[i]
      const actual = utils.normalizedWeightsCumSum(inputs[i])
      for (let j = 0; j < actual.length; j++) {
        expect(actual[j]).toBeCloseTo(expected[j])
      }
    }
  })

  test("doesn't accept empty arrays", () => {
    expect(() => utils.normalizedWeightsCumSum([])).toThrow()
  })

  test("doesn't accept non-positive values", () => {
    expect(() => utils.normalizedWeightsCumSum([1,  0, 1])).toThrow()
    expect(() => utils.normalizedWeightsCumSum([1, -2, 1])).toThrow()
    expect(() => utils.normalizedWeightsCumSum([1, -2, 0])).toThrow()
  })
})
