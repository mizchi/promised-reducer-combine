# promised-reducer-combine

Combine some promised-reducer's.

```
npm install promised-reducer --save
npm install promised-reducer-combine --save
```



See https://github.com/mizchi/promised-reducer

## How to use

```js
import PromisedReducer from "promised-reducer";
import combine = from "promised-reducer-combine";

const r1 = new PromisedReducer({a: 1});
const r2 = new PromisedReducer({b: 2});

// reducersMap: {r1: {a: number;}, r2: {b: number;}} => {a: number; b: number}
const composited = combine({r1, r2}, ({r1, r2}) => ({a: r1.a, b: r2.b}));
composited.on(":start-async-updating-by", name => console.log("async started by", name));
composited.on(":end-async-updating-by", name => console.log("async ended by", name));
composited.on(":update", combined => console.log("combined result", combined));
composited.on(":update-by", reducerName => console.log("update fired by", reducerName));

r1.update(s => Promise.resolve({a: s.a + 1}));
r2.update(s => Promise.resolve({b: s.b + 1}));

// async started by r1
// combined result { a: 2, b: 2 }
// update fired by r1
// combined result { a: 2, b: 3 }
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
