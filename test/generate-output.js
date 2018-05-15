const muffle = require("../");
const fs = require("fs");
const path = require("path");
const e2p = require("event-to-promise");

const methods = ["log", "info", "warn", "error"];
process.on("unhandledRejection", err => { throw err });

(async function () {
  muffle();
  spew("muffled");
  muffle.unmuffle();
  spew("unmuffled");

  // ensure we can pipe to stdout/stderr after unmuffle
  const s1 = fs.createReadStream(path.join(__dirname, "/nums"));
  const s2 = fs.createReadStream(path.join(__dirname, "/nums"));
  s1.pipe(process.stdout);
  s2.pipe(process.stderr);

  await Promise.all([
    e2p(s1, "close"),
    e2p(s2, "close")
  ])

  // ensure errors will appear even with muffling
  muffle();
  muffle.log("____");
  throw new Error("thrown error");
})()

function spew (stem) {
  methods.forEach((m) => {
    console[m](m, stem, "from console"); // these will not appear when muffle is active
    muffle[m](m, stem, "from muffle"); // these will always appear
  });
  // these writes will only come out when muffle is off
  process.stdout.write(stem + " stdout\n");
  process.stderr.write(stem + " stderr\n");
}
