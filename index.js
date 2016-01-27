var Console = require("console").Console;
var Writable = require("stream").Writable;

function makeDescriptor (get) {
  return { get: get, enumerable: true, configurable: true };
}

var ws = new Writable({ write: function () {} });
var silentConsole =  new Console(ws);

var descriptors = {
  console: {
    object: global,
    original: Object.getOwnPropertyDescriptor(global, "console"),
    silenced: makeDescriptor(function () { return silentConsole }),
  },
  stdout: {
    object: process,
    original: Object.getOwnPropertyDescriptor(process, "stdout"),
    silenced: makeDescriptor(function () { return ws }),
  },
  stderr: {
    object: process,
    original: Object.getOwnPropertyDescriptor(process, "stderr"),
    silenced: makeDescriptor(function () { return ws }),
  }
};

function muffle () {
  Object.keys(descriptors).forEach(function (k) {
    Object.defineProperty(descriptors[k].object, k, descriptors[k].silenced);
  });

  return function unmuffle () {
    Object.keys(descriptors).forEach(function (k) {
      Object.defineProperty(descriptors[k].object, k, descriptors[k].original);
    });
  }
}

module.exports = muffle;