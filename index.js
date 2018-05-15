var Console = require("console").Console;
var Writable = require("stream").Writable;

function makeGetter (ret) {
  return { get: () => ret, enumerable: true, configurable: true };
}

var isMuffled = false;
var _console  = global.console;

const noop = () => {}

function proxyMethod (source, proxy) {
  return function (key) {
    Object.defineProperty(proxy, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        if (typeof source[key] === "function" && isMuffled) {
          return noop;
        }
        return source[key];
      },
      set: function (k, value) {
        source[k] = value;
      }
    });
  };
}

function proxyWritable (stream) {
  var prox = new Writable({
    write: function (chunk, enc, cb) {
      if (!isMuffled) {
        return stream.write(chunk, enc, cb);
      }

      if (cb) setImmediate(cb);
      return true;
    }
  });
  prox.__proxyWritable = true;

  // necessary?
  prox.on("error", noop)

  return prox;
}

var consoleProxy = new Console(new Writable({
  write: function (chunk, enc, cb) {
    if (cb) setImmediate(cb);
    return true;
  }
}));
consoleProxy.__muffled = true;

function muffle () {
  isMuffled = true;
  return muffle;
}

muffle.unmuffle = function unmuffle () {
  isMuffled = false;
  return muffle;
};

muffle.isActive = function isActive () {
  return isMuffled;
};

var stdoutProxy = proxyWritable(process.stdout);
var stderrProxy = proxyWritable(process.stderr);
Object.defineProperty(global, "console", makeGetter(consoleProxy));
Object.defineProperty(process, "stdout", makeGetter(stdoutProxy));
Object.defineProperty(process, "stderr", makeGetter(stderrProxy));

Object.getOwnPropertyNames(Console.prototype).forEach((method) => {
  if (typeof Console.prototype[method] !== "function") return;
  if (method === "constructor") return;

  muffle[method] = (...args) => {
    _console[method](...args)
    return muffle;
  };

  consoleProxy[method] = (...args) => {
    if (isMuffled) return;
    return _console[method](...args)
  };
});

muffle.Console = _console.Console;

module.exports = muffle;
