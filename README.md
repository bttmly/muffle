# muffle

## Installation
`npm install muffle`

## Usage
Muffle exports a single function, which will squelch the console as well as `process.stdout` and `process.stderr`. All methods on `muffle` return the `muffle` function/object for chaining. 


```js
var muffle = require("muffle");

muffle();

console.log("this won't appear");
process.stdout.write("nor this\n");
muffle.log("this will appear -- all console methods are available")

muffle.unmuffle();

console.log("this will appear");
process.stdout.write("this too");
```

## Caveats
As long as muffle is the absolute first thing required in your app, you are guaranteed that all _userland code_ gets the muffled proxies of `console`, `stdout`, and `stderr`. HOWEVER, Node core and/or the V8 JavaScript runtime can still do things that end up in `stdout`/`stderr`, most obviously `throw`ing an error. Catching (or silencing) uncaught errors is beyond the scope of this module.