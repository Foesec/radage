#!/usr/bin/env node
const fs = require("fs")
const program = require("commander")
const radage = require("../")

let specPath, n, outPath

program
  .version("1.0.0")
  .arguments("<specPath> <n> [outPath]")
  .action((specArg, nArg, outArg) => {
    specPath = specArg
    n = Number(nArg)
    outPath = outArg
  })
  .parse(process.argv)

console.log(`Got\nspecPath: ${(typeof specPath) + " " + specPath}\nn: ${(typeof n) + " " + n}`)

const data = radage.generate(specPath, n)
const jsonString = JSON.stringify(data)

if (outPath) {
  fs.writeFileSync(outPath, jsonString)
} else {
  console.log(jsonString)
}