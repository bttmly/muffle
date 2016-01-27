var muffle = require("./"), unmuffle;

unmuffle = muffle();
spew()
unmuffle();
spew();

function spew () {
  process.stdout.write("stdout\n");
  process.stderr.write("stderr\n");
  ["log", "info", "warn", "error"].forEach(function (m) {
    console[m](m);
  });
}


