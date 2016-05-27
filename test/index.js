var muffle = require("../");

var path = require("path");
var expect = require("expect");

var DELIMITER = "____";
var script = "node " + __dirname + "/generate-output.js > " + __dirname + "/.output 2>&1";

try {
  // this script intentionally throws an error to demonstrate that errors still appear
  require("child_process").execSync(script);
} catch (e) { /* */ }

var output = require("fs").readFileSync(path.join(__dirname, "/.output"), "utf8").trim();

var chunks = output.split(DELIMITER);
var logs = chunks[0].split("\n").filter(Boolean);
var err = chunks[1];

describe("generated output", function () {
  var methods = ["log", "info", "warn", "error"];
  
  it("muffle.log() and friends work when muffling is active", function () {
    methods.forEach(function (m) {
      expect(logs).toInclude(m + " muffled from muffle");
    });
  });

  it("console.log() and friends don't work when muffling is active", function () {
    methods.forEach(function (m) {
      expect(logs).toExclude(m + " muffled from console");
    });
  });

  it("console.log() and friends work after unmuffle", function () {
    methods.forEach(function (m) {
      expect(logs).toInclude(m + " unmuffled from console");
    });
  });

  it("muffle.log() and friends also work after unmuffle", function () {
    methods.forEach(function (m) {
      expect(logs).toInclude(m + " unmuffled from muffle");
    });
  });

  it("stdout.write doesn't work when muffling is active", function () {
    expect(logs).toExclude("muffled stdout");
    expect(logs).toExclude("muffled stderr");
  });

  it("stdout.write works after unmuffle", function () {
    expect(logs).toInclude("unmuffled stdout");
    expect(logs).toInclude("unmuffled stderr");
  });

  it("the proxy stream wrappers can be piped to", function () {
    expect(logs).toInclude("1234567890");
  });

  it("thrown errors come out even when muffling is active", function () {
    expect(err).toInclude("thrown error");
  });
});

describe("muffle", function () {
  it(".isActive()", function () {
    muffle();
    var yes = muffle.isActive();
    muffle.unmuffle();
    var no = muffle.isActive();
    expect(yes).toEqual(true);
    expect(no).toEqual(false);
  });

  const methods = ["log", "info", "warn", "error", "dir", "time", "timeEnd", "trace", "assert"];
  it("has the console prototype methods", function () {
    methods.forEach(function (m) {
      expect(muffle[m]).toBeA("function");
    });
  });

  it("has the Console constructor", function () {
    expect(muffle.Console).toBeA("function");
  });
});
