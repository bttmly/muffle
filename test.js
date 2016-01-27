var assert = require("assert");

require("child_process").execSync("node ./test-output.js > .output 2>&1");

var output = require("fs").readFileSync(".output", "utf8").trim().split("\n").sort();
var expected = ["error", "info", "log", "stderr", "stdout", "warn"];

assert.deepEqual(output, expected);
console.log("looks good.");