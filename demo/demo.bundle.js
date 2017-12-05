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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_dispatcher__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__src_recorder__ = __webpack_require__(2);



/* `tracked` is an iframe containing the webpage we want to track.
 */
const tracked = document.getElementById('tracked')

/*
 * Initialize a new EventRecorder instance to track three types of events
 * - mousemove
 * - click
 * - scroll
 * When those events are triggered use the `extract` method provided to
 * extract the data & meta-data we need for each of those events.
 * Use the contentWindow of the `tracked` iframe as the context of the recorder.
 */
const recorder = new __WEBPACK_IMPORTED_MODULE_1__src_recorder__["a" /* default */]([
    'mousemove',
    'click',
    'scroll',
    'resize',
], {
    extract,
    context: tracked.contentWindow,
})

function extract(event, context) {
    switch(event.type) {
        case 'scroll':
            return {
                type: event.type,
                timestamp: event.timestamp || event.timeStamp,
                scrollY: context.scrollY,
                scrollX: context.scrollX,
            }
        case 'resize':
            return {
                type: event.type,
                timestamp: event.timestamp || event.timeStamp,
                width: context.innerWidth,
                height: context.innerHeight,
            }
        case 'click':
        case 'mousemove':
            return {
                type: event.type,
                clientX: event.clientX,
                clientY: event.clientY,
                timestamp: event.timestamp || event.timeStamp,
            }
    }
}

/*
 * Create new EventDispatcher instance to replay our captured events.
 * Use the provided `trigger` function to determine how each type of event
 * is to be replayed on the webpage.
 * Like above, set the context to be the contentWindow of our tracked iframe.
 */
const player = new __WEBPACK_IMPORTED_MODULE_0__src_dispatcher__["a" /* default */]({
    trigger,
    context: tracked.contentWindow,
})

function trigger(event, context) {
    let cursor = context.document.getElementById('cursor')
    if (!cursor) {
        cursor = context.document.createElement('div')
        cursor.id = 'cursor'
        cursor.style.backgroundColor = 'red'
        cursor.style.position = 'fixed'
        cursor.style.width = '15px'
        cursor.style.height = '15px'
        context.document.body.appendChild(cursor)
    }
    switch(event.type) {
        case 'mousemove':
            // todo: use CSS transitions, use GPU off main thread
            cursor.style.top = (event.clientY) + 'px'
            cursor.style.left = (event.clientX) + 'px'
            break
        case 'click':
            const clone = cursor.cloneNode()
            clone.removeAttribute('id')
            clone.style.position = 'absolute'
            clone.style.top = (context.scrollY + event.clientY) + 'px'
            clone.style.left = (context.scrollX + event.clientX) + 'px'
            context.document.body.appendChild(clone)
            break
        case 'scroll':
            context.scrollTo(event.scrollX, event.scrollY)
            break
    }
}

/*
 * Provide some helper methods so that the user can easily start/pause
 * recordings.
 */
window.play = () => {
    tracked.contentWindow.scrollTo(0, 0)
    recorder.stop()
    player.play(recorder.queue)
}

window.pause = () => {
    player.stop()
}

window.record = () => {
    player.stop()
    recorder.start()
}
window.restart = () => {
    player.restart()
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class EventDispatcher {
    constructor({ trigger, context=window }) {
        this.props = {
            trigger,
            context,
        }
        this.isPaused = true
        this.currentFrame = 0
        this.currentActions = []
    }
    dispatch(actions=this.currentActions, frame=this.currentFrame) {
        const { trigger, context } = this.props
        const { isPaused } = this

        const next = actions[frame]
        const previous = actions[frame - 1]

        if (!next || isPaused) { return }

        this.currentActions = actions
        this.currentFrame = frame

        const timeout = previous ?
            new Date(next.timestamp) - new Date(previous.timestamp) :
            0

        console.log(`dispatching #${ frame } (${ next.type }) in ${ timeout }ms`)

        setTimeout(() => {
            requestAnimationFrame(() => {
                try {
                    trigger(next, context)
                } catch(e) {
                    console.error(`Error triggering event "${ next.type }"`)
                    console.error(e)
                }

                this.dispatch(actions, ++frame)
            })
        }, timeout)
    }
    play(actions, frame) {
        this.isPaused = false
        this.dispatch(actions, frame)
        console.log('play', frame)
    }
    stop() {
        this.isPaused = true
        console.log('stop')
    }
    restart() {
        this.play(this.currentActions, 0)
    }
}

/* harmony default export */ __webpack_exports__["a"] = (EventDispatcher);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class EventRecorder {
    constructor(events, { extract, context=window }) {
        this.events = events
        this.capture = this.capture.bind(this)
        this.queue = []
        this.props = {
            extract,
            context,
        }
    }
    start() {
        const { events, capture } = this
        const { context } = this.props

        events.map(name =>
            context.addEventListener(name, capture)
        )
    }
    stop() {
        const { events, capture } = this
        const { context } = this.props

        events.map(name =>
            context.removeEventListener(name, capture)
        )
    }
    capture(event) {
        const { extract, context } = this.props
        const { queue } = this

        const action = extract(event, context)

        if (action) {
            console.log('capture', action.type, action)
            queue.push(action)
        }
    }
}

/* harmony default export */ __webpack_exports__["a"] = (EventRecorder);


/***/ })
/******/ ]);