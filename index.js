const { Console } = require("console");
const { Writable } = require("stream");

function makeGetter (ret) {
  return { get: () => ret, enumerable: true, configurable: true };
}

let isMuffled = false;
const _console  = global.console;
const muffleSymbol = Symbol("muffle");

function proxyWritable (stream) {
  const prox = new Writable({
    write (chunk, enc, cb) {
      if (!isMuffled) {
        return stream.write(chunk, enc, cb);
      }

      if (cb) setImmediate(cb);
      return true;
    }
  });
  prox[muffleSymbol] = true;
  return prox;
}

const consoleProxy = new Console(new Writable({
  write (chunk, enc, cb) {
    if (cb) setImmediate(cb);
    return true;
  }
}));
consoleProxy[muffleSymbol] = true;

function muffle () {
  isMuffled = true;
  return muffle;
}

muffle.unmuffle = () => {
  isMuffled = false;
  return muffle;
};

muffle.isActive = () => {
  return isMuffled;
};

muffle.Console = _console.Console;

const stdoutProxy = proxyWritable(process.stdout);
const stderrProxy = proxyWritable(process.stderr);
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


module.exports = muffle;
module.exports.symbol = muffleSymbol;