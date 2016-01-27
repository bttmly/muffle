# muffle

## Installation
`npm install muffle`

## Usage
Muffle exports a single function, which will squelch the console as well as `process.stdout` and `process.stderr`. You can restore these by calling the returned function.

```js
var muffle = require("muffle");

console.log("from console");
process.stdout.write("from stdout\n");

var restore = muffle();

console.log("this doesn't come out");
process.stdout.write("nor this\n");

restore();

console.log("... and we're back");
```