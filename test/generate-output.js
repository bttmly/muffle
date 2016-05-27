var muffle = require("../");
var fs = require("fs");
var path = require("path");

function allClosed (streams, fn) {
  var count = streams.length;
  var done = 0;

  function handle () {
    if (++done === count) fn();
  }

  streams.forEach(function (stream) {
    stream.on("close", handle);
  });
}

var methods = ["log", "info", "warn", "error"];

var series = [
  function one (next) {
    muffle();
    spew("muffled");
    process.stdout.emit("error", new Error("unhandled error event"));
    muffle.unmuffle();
    spew("unmuffled");
    next();
  },

  function two (next) {
    var s1 = fs.createReadStream(path.join(__dirname, "/nums"));
    var s2 = fs.createReadStream(path.join(__dirname, "/nums"));
    s1.pipe(process.stdout);
    s2.pipe(process.stderr);
    allClosed([s1, s2], next);
  },

  function three () {
    muffle();
    muffle.log("____"); // delimiter
    throw new Error("thrown error");
  }
];

function run (_fns, cb) {
  var fns = _fns.slice();
  (function next () {
    if (fns.length === 0) {
      return cb();
    }
    fns.shift()(next);
  })();
}


function spew (stem) {
  methods.forEach(function (m) {
    console[m](m, stem, "from console"); // these will not appear when muffle is active
    muffle[m](m, stem, "from muffle"); // these will always appear
  });
  // these writes will only come out when muffle is off
  process.stdout.write(stem + " stdout\n");
  process.stderr.write(stem + " stderr\n");
}

run(series, function () { /* we'll have a thrown error before this can be called */ });



