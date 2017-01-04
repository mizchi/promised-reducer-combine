'use strict';
const PromisedReducer = require("promised-reducer").default;
const combine = require("./index");

// Usages:
//
// class CombinedReducer<T> extends PromisedReducer<T>
//
// type ReducersMap = {[reducerName]: PromisedReducer};
// function combine<T>(
//   reducersMap: ReducersMap;
//   combineFunc: (rm: ReducersMap) => T
// ): CombinedReducer<T>;

const r1 = new PromisedReducer({a: 1});
const r2 = new PromisedReducer({b: 2});

// async
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
