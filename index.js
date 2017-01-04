'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PromisedReducer = require("promised-reducer").default;
module.exports = combine;

function combine(reducersMap, combineFunc) {
  return new CombinedReducer(reducersMap, combineFunc);
}

// polyfill
function includes(arr, item) {
  return arr.filter(function (i) {
    return i === item;
  }).length > 0;
}

function _getCurrentState(reducersMap, combineFunc) {
  var keyToState = {};
  for (var key in reducersMap) {
    var reducer = reducersMap[key];
    keyToState[key] = reducer.state;
  }
  return combineFunc(keyToState);
}

var CombinedReducer = function (_PromisedReducer) {
  _inherits(CombinedReducer, _PromisedReducer);

  function CombinedReducer(reducersMap, combineFunc) {
    _classCallCheck(this, CombinedReducer);

    var initial = _getCurrentState(reducersMap, combineFunc);

    var _this = _possibleConstructorReturn(this, (CombinedReducer.__proto__ || Object.getPrototypeOf(CombinedReducer)).call(this, initial));

    _this._onDestroy = [];
    _this._onProgressReducers = [];

    var _loop = function _loop(key) {
      var reducer = reducersMap[key];

      // on update
      var onUpdate = function onUpdate(obj) {
        _this.update(function (_old) {
          return _getCurrentState(reducersMap, combineFunc);
        });
        _this.emit(":update-by", key);
      };
      reducer.on(":update", onUpdate);
      _this._onDestroy.push(function () {
        return reducer.off(":update", onUpdate);
      });

      // on start-async-updating
      var onStartAsyncUpdating = function onStartAsyncUpdating(obj) {
        var beforeOnProgressReducerCount = _this._onProgressReducers.length;

        if (!includes(_this._onProgressReducers, reducer)) {
          _this._onProgressReducers.push(reducer);
        }

        if (beforeOnProgressReducerCount === 0 && _this._onProgressReducers.length > 0) {
          _this.emit(":start-async-updating-by", key);
        }
      };
      reducer.on(":start-async-updating", onStartAsyncUpdating);
      _this._onDestroy.push(function () {
        return reducer.off(":start-async-updating", onStartAsyncUpdating);
      });

      // on end-async-updating WIP
      var onEndAsyncUpdating = function onEndAsyncUpdating() {
        var beforeOnProgressReducerCount = _this._onProgressReducers.length;

        if (includes(_this._onProgressReducers, reducer)) {
          _this._onProgressReducers = _this._onProgressReducers.filter(function (i) {
            return i !== reducer;
          });
        }

        if (beforeOnProgressReducerCount > 0 && _this._onProgressReducers.length === 0) {
          _this.emit(":end-async-updating-by", key);
        }
      };
      reducer.on(":end-async-updating", onEndAsyncUpdating);
      _this._onDestroy.push(function () {
        return reducer.off(":end-async-updating", onEndAsyncUpdating);
      });
    };

    for (var key in reducersMap) {
      _loop(key);
    }

    return _this;
  }

  _createClass(CombinedReducer, [{
    key: "getReducerByName",
    value: function getReducerByName(name) {
      return this._reducersMap[name];
    }
  }, {
    key: "isProgressinsgAsync",
    value: function isProgressinsgAsync() {
      return this._onProgressReducers.length > 0;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._onDestroy[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var f = _step.value;

          f();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.removeAllListeners();
      this._onProgressReducers = [];
    }
  }]);

  return CombinedReducer;
}(PromisedReducer);
