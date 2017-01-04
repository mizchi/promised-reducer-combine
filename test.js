'use strict';
const PromisedReducer = require("promised-reducer").default;

// polyfill
function includes(arr, item) {
  return arr.filter(i => i === item).length > 0;
}

function combine(reducersMap, combineFunc) {
  return new CombinedReducer(reducersMap, combineFunc);
}

function _getCurrentState(reducersMap, combineFunc) {
  const keyToState = {};
  for (const key in reducersMap) {
    const reducer = reducersMap[key];
    keyToState[key] = reducer.state;
  }
  return combineFunc(keyToState);
}

class CombinedReducer extends PromisedReducer {
  constructor(reducersMap, combineFunc) {
    const initial = _getCurrentState(reducersMap, combineFunc);

    super(initial);
    this._onDestroy = [];
    this._onProgressReducers = [];

    for (const key in reducersMap) {
      const reducer = reducersMap[key];

      // on update
      const onUpdate = obj => {
        this.update(_old => _getCurrentState(reducersMap, combineFunc));
        this.emit(":update-by", key);
      };
      reducer.on(":update", onUpdate);
      this._onDestroy.push(() => reducer.off(":update", onUpdate));

      // on start-async-updating
      const onStartAsyncUpdating = obj => {
        const beforeOnProgressReducerCount = this._onProgressReducers.length;

        if (!includes(this._onProgressReducers, reducer)) {
          this._onProgressReducers.push(reducer);
        }

        if (
          beforeOnProgressReducerCount === 0 &&
          this._onProgressReducers.length > 0
        ) {
          this.emit(":start-async-updating-by", key);
        }
      };
      reducer.on(":start-async-updating", onStartAsyncUpdating);
      this._onDestroy.push(() => reducer.off(":start-async-updating", onStartAsyncUpdating));

      // on end-async-updating WIP
      const onEndAsyncUpdating = () => {
        console.log("onEndAsyncUpdating", key);
        const beforeOnProgressReducerCount = this._onProgressReducers.length;

        if (includes(onProgressReducers, reducer)) {
          this._onProgressReducers = this._onProgressReducers.filter(i => i !== reducer);
        }

        if (
          beforeOnProgressReducerCount > 0 &&
          this._onProgressReducers.length === 0
        ) {
          this.emit(":end-async-updating-by", key);
        }
      };
      reducer.on(":end-async-updating", onEndAsyncUpdating);
      this._onDestroy.push(() => reducer.off(":end-async-updating", onEndAsyncUpdating));
    }

  }

  getReducerByName(name) {
    return this._reducersMap[name];
  }

  isProgressinsgAsync() {
    return this._onProgressReducers.length > 0
  }

  destroy() {
    for (const f of this._onDestroy) {
      f();
    }
    this.removeAllListeners();
    this._onProgressReducers = [];
  }
}

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
const composited2 = combine({r1, r2}, ({r1, r2}) => ({r1, r2}));
composited2.on(":start-async-updating-by", name => console.log("async started by", name));
composited2.on(":update", combined => console.log("combined result", combined));
composited2.on(":update-by", reducerName => console.log("update fired by", reducerName));

r1.update(s => Promise.resolve({a: s.a + 1}));
r2.update(s => Promise.resolve({b: s.b + 1}));
