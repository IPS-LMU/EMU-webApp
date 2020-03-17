/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/comlink/dist/esm/comlink.mjs
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const proxyMarker = Symbol("Comlink.proxy");
const createEndpoint = Symbol("Comlink.endpoint");
const releaseProxy = Symbol("Comlink.releaseProxy");
const throwSet = new WeakSet();
const transferHandlers = new Map([
    [
        "proxy",
        {
            canHandle: obj => obj && obj[proxyMarker],
            serialize(obj) {
                const { port1, port2 } = new MessageChannel();
                expose(obj, port1);
                return [port2, [port2]];
            },
            deserialize: (port) => {
                port.start();
                return wrap(port);
            }
        }
    ],
    [
        "throw",
        {
            canHandle: obj => throwSet.has(obj),
            serialize(obj) {
                const isError = obj instanceof Error;
                let serialized = obj;
                if (isError) {
                    serialized = {
                        isError,
                        message: obj.message,
                        stack: obj.stack
                    };
                }
                return [serialized, []];
            },
            deserialize(obj) {
                if (obj.isError) {
                    throw Object.assign(new Error(), obj);
                }
                throw obj;
            }
        }
    ]
]);
function expose(obj, ep = self) {
    ep.addEventListener("message", function callback(ev) {
        if (!ev || !ev.data) {
            return;
        }
        const { id, type, path } = Object.assign({ path: [] }, ev.data);
        const argumentList = (ev.data.argumentList || []).map(fromWireValue);
        let returnValue;
        try {
            const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);
            const rawValue = path.reduce((obj, prop) => obj[prop], obj);
            switch (type) {
                case 0 /* GET */:
                    {
                        returnValue = rawValue;
                    }
                    break;
                case 1 /* SET */:
                    {
                        parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
                        returnValue = true;
                    }
                    break;
                case 2 /* APPLY */:
                    {
                        returnValue = rawValue.apply(parent, argumentList);
                    }
                    break;
                case 3 /* CONSTRUCT */:
                    {
                        const value = new rawValue(...argumentList);
                        returnValue = proxy(value);
                    }
                    break;
                case 4 /* ENDPOINT */:
                    {
                        const { port1, port2 } = new MessageChannel();
                        expose(obj, port2);
                        returnValue = transfer(port1, [port1]);
                    }
                    break;
                case 5 /* RELEASE */:
                    {
                        returnValue = undefined;
                    }
                    break;
            }
        }
        catch (e) {
            returnValue = e;
            throwSet.add(e);
        }
        Promise.resolve(returnValue)
            .catch(e => {
            throwSet.add(e);
            return e;
        })
            .then(returnValue => {
            const [wireValue, transferables] = toWireValue(returnValue);
            ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
            if (type === 5 /* RELEASE */) {
                // detach and deactive after sending release response above.
                ep.removeEventListener("message", callback);
                closeEndPoint(ep);
            }
        });
    });
    if (ep.start) {
        ep.start();
    }
}
function isMessagePort(endpoint) {
    return endpoint.constructor.name === "MessagePort";
}
function closeEndPoint(endpoint) {
    if (isMessagePort(endpoint))
        endpoint.close();
}
function wrap(ep, target) {
    return createProxy(ep, [], target);
}
function throwIfProxyReleased(isReleased) {
    if (isReleased) {
        throw new Error("Proxy has been released and is not useable");
    }
}
function createProxy(ep, path = [], target = function () { }) {
    let isProxyReleased = false;
    const proxy = new Proxy(target, {
        get(_target, prop) {
            throwIfProxyReleased(isProxyReleased);
            if (prop === releaseProxy) {
                return () => {
                    return requestResponseMessage(ep, {
                        type: 5 /* RELEASE */,
                        path: path.map(p => p.toString())
                    }).then(() => {
                        closeEndPoint(ep);
                        isProxyReleased = true;
                    });
                };
            }
            if (prop === "then") {
                if (path.length === 0) {
                    return { then: () => proxy };
                }
                const r = requestResponseMessage(ep, {
                    type: 0 /* GET */,
                    path: path.map(p => p.toString())
                }).then(fromWireValue);
                return r.then.bind(r);
            }
            return createProxy(ep, [...path, prop]);
        },
        set(_target, prop, rawValue) {
            throwIfProxyReleased(isProxyReleased);
            // FIXME: ES6 Proxy Handler `set` methods are supposed to return a
            // boolean. To show good will, we return true asynchronously ¯\_(ツ)_/¯
            const [value, transferables] = toWireValue(rawValue);
            return requestResponseMessage(ep, {
                type: 1 /* SET */,
                path: [...path, prop].map(p => p.toString()),
                value
            }, transferables).then(fromWireValue);
        },
        apply(_target, _thisArg, rawArgumentList) {
            throwIfProxyReleased(isProxyReleased);
            const last = path[path.length - 1];
            if (last === createEndpoint) {
                return requestResponseMessage(ep, {
                    type: 4 /* ENDPOINT */
                }).then(fromWireValue);
            }
            // We just pretend that `bind()` didn’t happen.
            if (last === "bind") {
                return createProxy(ep, path.slice(0, -1));
            }
            const [argumentList, transferables] = processArguments(rawArgumentList);
            return requestResponseMessage(ep, {
                type: 2 /* APPLY */,
                path: path.map(p => p.toString()),
                argumentList
            }, transferables).then(fromWireValue);
        },
        construct(_target, rawArgumentList) {
            throwIfProxyReleased(isProxyReleased);
            const [argumentList, transferables] = processArguments(rawArgumentList);
            return requestResponseMessage(ep, {
                type: 3 /* CONSTRUCT */,
                path: path.map(p => p.toString()),
                argumentList
            }, transferables).then(fromWireValue);
        }
    });
    return proxy;
}
function myFlat(arr) {
    return Array.prototype.concat.apply([], arr);
}
function processArguments(argumentList) {
    const processed = argumentList.map(toWireValue);
    return [processed.map(v => v[0]), myFlat(processed.map(v => v[1]))];
}
const transferCache = new WeakMap();
function transfer(obj, transfers) {
    transferCache.set(obj, transfers);
    return obj;
}
function proxy(obj) {
    return Object.assign(obj, { [proxyMarker]: true });
}
function windowEndpoint(w, context = self, targetOrigin = "*") {
    return {
        postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),
        addEventListener: context.addEventListener.bind(context),
        removeEventListener: context.removeEventListener.bind(context)
    };
}
function toWireValue(value) {
    for (const [name, handler] of transferHandlers) {
        if (handler.canHandle(value)) {
            const [serializedValue, transferables] = handler.serialize(value);
            return [
                {
                    type: 3 /* HANDLER */,
                    name,
                    value: serializedValue
                },
                transferables
            ];
        }
    }
    return [
        {
            type: 0 /* RAW */,
            value
        },
        transferCache.get(value) || []
    ];
}
function fromWireValue(value) {
    switch (value.type) {
        case 3 /* HANDLER */:
            return transferHandlers.get(value.name).deserialize(value.value);
        case 0 /* RAW */:
            return value.value;
    }
}
function requestResponseMessage(ep, msg, transfers) {
    return new Promise(resolve => {
        const id = generateUUID();
        ep.addEventListener("message", function l(ev) {
            if (!ev.data || !ev.data.id || ev.data.id !== id) {
                return;
            }
            ep.removeEventListener("message", l);
            resolve(ev.data);
        });
        if (ep.start) {
            ep.start();
        }
        ep.postMessage(Object.assign({ id }, msg), transfers);
    });
}
function generateUUID() {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}


//# sourceMappingURL=comlink.mjs.map

// CONCATENATED MODULE: ./node_modules/comlink-loader/dist/comlink-worker-loader.js!./node_modules/ts-loader!./app/scripts/workers/hierarchy.worker.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HierarchyWorker", function() { return HierarchyWorker; });

  var HierarchyWorker = /** @class */ (function () {
    ///////////////////////////
    // public api
    function HierarchyWorker() {
    }
    HierarchyWorker.prototype.reduceAnnotationToViewableTimeAndPath = function (annotation, path, viewPortStartSample, viewPortEndSample) {
        var _this = this;
        this.idHashMap = undefined; // reset 4       
        this.linkHashMap = undefined;
        this.createIdHashMap(path, annotation);
        this.createLinkHashMap(annotation); // from child to parents
        var childLevel = this.reduceToItemsWithTimeInView(annotation, path, viewPortStartSample, viewPortEndSample);
        // clone and empty annotation
        var annotationClone = JSON.parse(JSON.stringify(annotation));
        annotationClone.levels = [];
        annotationClone.links = [];
        var reachedTargetLevel = false;
        path.forEach(function (ln, lnIdx) {
            if (ln === path[path.length - 1]) {
                reachedTargetLevel = true;
            }
            if (!reachedTargetLevel) {
                if (ln !== path[path.length - 1]) {
                    var parentLevelClone = JSON.parse(JSON.stringify(_this.getLevelDetails(path[lnIdx + 1], annotation)));
                    parentLevelClone.items = [];
                    _this.giveTimeToParentsAndAppendItemsAndLinks(annotationClone, parentLevelClone, childLevel);
                    annotationClone.levels.push(parentLevelClone);
                    childLevel = annotationClone.levels[annotationClone.levels.length - 1];
                }
            }
        });
        return annotationClone;
    };
    /**
    * returns level details by passing in level name
    * if the corresponding level exists
    * otherwise returns 'null'
    *    @param name
    */
    HierarchyWorker.prototype.getLevelDetails = function (name, annotation) {
        var ret = null;
        annotation.levels.forEach(function (level) {
            if (level.name === name) {
                ret = level;
            }
        });
        return ret;
    };
    ;
    ///////////////////////////
    // private api
    HierarchyWorker.prototype.reduceToItemsWithTimeInView = function (annotation, path, viewPortStartSample, viewPortEndSample) {
        var subLevelWithTime = this.getLevelDetails(path[0], annotation);
        var subLevelWithTimeClone = JSON.parse(JSON.stringify(subLevelWithTime));
        subLevelWithTimeClone.items = [];
        // let itemsInView = [];
        subLevelWithTime.items.forEach(function (item) {
            if (item.sampleStart + item.sampleDur > viewPortStartSample && item.sampleStart < viewPortEndSample) {
                subLevelWithTimeClone.items.push(item);
            }
        });
        return subLevelWithTimeClone;
    };
    HierarchyWorker.prototype.giveTimeToParentsAndAppendItemsAndLinks = function (annotation, parentLevel, childLevel) {
        var _this = this;
        childLevel.items.forEach(function (item) {
            var parentIds = _this.linkHashMap.get(item.id);
            parentIds.forEach(function (parentId) {
                var parentItem = _this.idHashMap.get(parentId);
                // console.log(parentId);
                // console.log(parentItem);
                if (typeof parentItem !== 'undefined') { // as only levels in path are in idHashMap 
                    if (parentItem.labels[0].name === parentLevel.name) {
                        // append link
                        annotation.links.push({
                            fromID: parentId,
                            toID: item.id
                        });
                        // add time info
                        if (typeof parentItem.sampleStart === 'undefined') {
                            parentItem.sampleStart = item.sampleStart;
                            parentItem.sampleDur = item.sampleDur;
                        }
                        else if (item.sampleStart < parentItem.sampleStart) {
                            parentItem.sampleStart = item.sampleStart;
                        }
                        else if (item.sampleStart + item.sampleDur > parentItem.sampleStart + parentItem.sampleDur) {
                            parentItem.sampleDur = item.sampleStart + item.sampleDur - parentItem.sampleStart;
                        }
                        // append item
                        parentLevel.items.push(parentItem);
                    }
                }
                // check if parent is on right level
            });
        });
    };
    HierarchyWorker.prototype.giveTimeToParents = function (levelName, annotation, subLevelWithTime) {
        var _this = this;
        var level;
        if (levelName === subLevelWithTime.name) {
            level = subLevelWithTime;
        }
        else {
            level = this.getLevelDetails(levelName, annotation);
        }
        level.items.forEach(function (item) {
            var parentId = _this.linkHashMap.get(item.id);
            var parents = _this.idHashMap.get(parentId);
            if (parents) {
                parents.forEach(function (parent) {
                    if (typeof parent.sampleStart === 'undefined') {
                        parent.sampleStart = item.sampleStart;
                        parent.sampleDur = item.sampleDur;
                    }
                    else if (item.sampleStart < parent.sampleStart) {
                        parent.sampleStart = item.sampleStart;
                    }
                    else if (item.sampleStart + item.sampleDur > parent.sampleStart + parent.sampleDur) {
                        parent.sampleDur = item.sampleStart + item.sampleDur - parent.sampleStart;
                    }
                });
            }
        });
    };
    HierarchyWorker.prototype.createIdHashMap = function (path, annotation) {
        var _this = this;
        this.idHashMap = new Map();
        path.forEach(function (levelName) {
            var level = _this.getLevelDetails(levelName, annotation);
            level.items.forEach(function (item) {
                _this.idHashMap.set(item.id, item);
            });
        });
    };
    HierarchyWorker.prototype.createLinkHashMap = function (annotation) {
        var _this = this;
        this.linkHashMap = new Map();
        annotation.links.forEach(function (link) {
            if (!_this.linkHashMap.has(link.toID)) {
                _this.linkHashMap.set(link.toID, [link.fromID]);
            }
            else {
                var prevParents = _this.linkHashMap.get(link.toID);
                prevParents.push(link.fromID);
                _this.linkHashMap.set(link.toID, prevParents);
            }
        });
    };
    return HierarchyWorker;
}());

;
  expose(
    Object.keys(__webpack_exports__).reduce(function(r,k){
      if (k=='__esModule') return r;
      r[k] = __webpack_exports__[k];
      return r
    },{})
  )

/***/ })
/******/ ]);