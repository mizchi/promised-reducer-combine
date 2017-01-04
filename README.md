# promised-reducer-combine

Combine some promised-reducer's.

See https://github.com/mizchi/promised-reducer

## How to use

```js
const r1 = new PromisedReducer({a: 1});
const r2 = new PromisedReducer({b: 2});

// async
const composited = combine({r1, r2}, ({r1, r2}) => ({r1, r2}));
composited.on(":start-async-updating-by", name => console.log("async started by", name));
composited.on(":end-async-updating-by", name => console.log("async ended by", name));
composited.on(":update", combined => console.log("combined result", combined));
composited.on(":update-by", reducerName => console.log("update fired by", reducerName));

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
