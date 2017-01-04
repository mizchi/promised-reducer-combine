# promised-reducer-combine

Combine some promised-reducer's.

```
npm install promised-reducer --save
npm install promised-reducer-combine --save
```



See https://github.com/mizchi/promised-reducer

## How to use

```js
const PromisedReducer = require("promised-reducer").default;
const combine = require("promised-reducer-combine").default;
const r1 = new PromisedReducer({a: 1});
const r2 = new PromisedReducer({b: 2});

// async
const combined = combine({r1, r2}, ({r1, r2}) => ({r1, r2}));
combined.on(":start-async-updating-by", name => console.log("async started by", name));
combined.on(":end-async-updating-by", name => console.log("async ended by", name));
combined.on(":update", data => console.log("combined result", data));
combined.on(":update-by", reducerName => console.log("update fired by", reducerName));

r1.update(s => Promise.resolve({a: s.a + 1}));
r2.update(s => Promise.resolve({b: s.b + 1}));

// async started by r1
// combined result { r1: { a: 2 }, r2: { b: 2 } }
// update fired by r1
// combined result { r1: { a: 2 }, r2: { b: 3 } }
// update fired by r2
// async ended by r2
```

## API

```js
declare class PromisedReducer<T> extends EventEmitter;
declare class CombinedReducer<T> extends PromisedReducer<T>;

declare type ReducersMap = {[reducerName]: PromisedReducer};
export default function combine<T>(
  reducersMap: ReducersMap;
  combineFunc: (rm: ReducersMap) => T
): CombinedReducer<T>;
```

## TODO

- Write more tests
- Add document


## License

MIT
