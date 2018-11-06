const valueGenerators = require("../lib/valueGenerators")

describe("select valueGenerator", () => {
  test("accepts only simple values array", () => {
    const spec = {
      values: ["A", "B", "C"]
    }
    const n = 100
    const generator = valueGenerators.select(spec)
    for (let i = 0; i < n; i++) {
      expect(spec.values.includes(generator())).toBe(true)
    }
  })

  test("accepts only argument n", () => {
    const spec = {
      n: 3
    }
    const n = 1000
    const gen = valueGenerators.select(spec)
    const distinctValues = new Set()
    for (let i = 0; i < n; i++) {
      distinctValues.add(gen())
    }
    expect(distinctValues.size).toBe(spec.n)
  })

  test("accepts weights with values array", () => {
    const spec = {
      values: ["A", "B", "C"],
      weights: [1, 3, 5]
    }
    const n = 100
    const generator = valueGenerators.select(spec)
    for (let i = 0; i < n; i++) {
      expect(spec.values.includes(generator())).toBe(true)
    }
  })

  test("accepts weights with argument n", () => {
    const spec = {
      n: 3,
      weights: [1, 3, 5]
    }
    const n = 1000
    const gen = valueGenerators.select(spec)
    const distinctValues = new Set()
    for (let i = 0; i < n; i++) {
      distinctValues.add(gen())
    }
    expect(distinctValues.size).toBe(spec.n)
  })

  test("does not accept both arguments n and values at the same time", () => {
    const spec = {
      values: ["A", "B", "C"],
      n: 3
    }
    expect(() => valueGenerators.select(spec)).toThrow()
  })

  test("does not accept an empty values array", () => {
    const spec = {
      values: [],
    }
    expect(() => valueGenerators.select(spec)).toThrow()
  })

  test("does not accept n smaller than 1", () => {
    const spec1 = {
      n: 0
    }
    const spec2 = {
      n: -3
    }
    expect(() => valueGenerators.select(spec1)).toThrow()
    expect(() => valueGenerators.select(spec2)).toThrow()
  })

  test("does not accept lenght mismatch between weights and n or values", () => {
    const spec1 = {
      n: 3,
      weights: [1, 1, 1, 1]
    }
    const spec2 = {
      values: ["A", "B", "C"],
      weights: [1, 2, 3, 4]
    }
    expect(() => valueGenerators.select(spec1)).toThrow()
    expect(() => valueGenerators.select(spec2)).toThrow()
  })
})

describe("loop valueGenerator", () => {
  test("accepts values argument", () => {
    const spec = {
      values: ["First", "Second", "Third"]
    }
    const gen = valueGenerators.loop(spec)
    const n = 10
    const producedValues = new Array(n)
    for (let i = 0; i < n; i++) {
      producedValues[i] = gen()
    }
    expect(producedValues).toEqual([
      "First", "Second", "Third",
      "First", "Second", "Third",
      "First", "Second", "Third",
      "First"
    ])
  })

  test("does not accept empty or missing values argument", () => {
    const spec1 = {
      values: []
    }
    const spec2 = {}
    expect(() => valueGenerators.loop(spec1)).toThrow()
    expect(() => valueGenerators.loop(spec2)).toThrow()
    expect(() => valueGenerators.loop()).toThrow()
  })
})