"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualElementPool = void 0;
var VirtualElement = /** @class */ (function () {
    function VirtualElement() {
        this.native = this.createNativeElement();
        this.textContent = "";
        this.style = {};
        this.nextTextContent = "";
        this.nextStyle = {};
    }
    VirtualElement.prototype.createNativeElement = function () {
        var el = document.createElement("div");
        el.style.position = "absolute";
        el.style.left = "0px";
        el.style.top = "0px";
        // Move it out of screen
        //  el.style.transform = 'translateX(-999px, -999px)';
        // Hide the element
        el.style.display = "none";
        el.style.pointerEvents = "none";
        return el;
    };
    return VirtualElement;
}());
/**
 * This class manages a pool of DOM elements that can be used to display
 * text labels on the screen. This is useful to avoid creating and destroying
 * DOM elements for each label, which can be expensive.
 *
 * The pool has a fixed capacity, and will reuse elements that are not in use.
 * It can be used to show and hide labels for different clients.
 *
 * The pool will automatically apply the necessary changes to the DOM when
 * the `scheduleUpdate` method is called.
 */
var VirtualElementPool = /** @class */ (function () {
    function VirtualElementPool() {
    }
    Object.defineProperty(VirtualElementPool, "containerEl", {
        get: function () {
            return document.querySelector("#model");
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Apply DOM diffing
     */
    VirtualElementPool.commitUpdate = function () {
        var _a;
        this.updateScheduled = false;
        for (var _i = 0, _b = this.allElements; _i < _b.length; _i++) {
            var ve = _b[_i];
            for (var _c = 0, _d = Object.keys(ve.nextStyle); _c < _d.length; _c++) {
                var prop = _d[_c];
                if (ve.nextStyle[prop] !== ve.style[prop]) {
                    ve.native.style[prop] = ve.nextStyle[prop];
                }
            }
            for (var _e = 0, _f = Object.keys(ve.style); _e < _f.length; _e++) {
                var prop = _f[_e];
                if (!ve.nextStyle.hasOwnProperty(prop)) {
                    ve.native.style[prop] = "";
                }
            }
            ve.style = ve.nextStyle;
            if (ve.nextTextContent !== ve.textContent) {
                ve.native.textContent = ve.textContent = ve.nextTextContent;
            }
            if (!ve.native.parentElement) {
                (_a = this.containerEl) === null || _a === void 0 ? void 0 : _a.append(ve.native);
            }
            ve.nextStyle = {};
            ve.nextTextContent = "";
        }
    };
    /**
     * Schedule an update to apply the changes to the DOM.
     */
    VirtualElementPool.scheduleUpdate = function () {
        var _this = this;
        if (!this.updateScheduled) {
            this.updateScheduled = true;
            queueMicrotask(function () {
                _this.commitUpdate();
            });
        }
    };
    /**
     * Explain the logic of the function ****************************************************
     * @param {*} type
     * @returns
     */
    VirtualElementPool.getActiveElementsByType = function (type) {
        if (!this.activeElements.has(type)) {
            this.activeElements.set(type, new Map());
        }
        return this.activeElements.get(type);
    };
    VirtualElementPool.getFreeElementsByType = function (type) {
        if (!this.freeElements.has(type)) {
            this.freeElements.set(type, []);
        }
        return this.freeElements.get(type);
    };
    VirtualElementPool.createElement = function () {
        var ve = new VirtualElement();
        VirtualElementPool.allElements.push(ve);
        return ve;
    };
    /**
     * Explain the logic of the function ****************************************************
     * @param {*} type
     * @returns
     */
    VirtualElementPool.allocateElement = function (type) {
        var freeElements = this.getFreeElementsByType(type);
        if (freeElements.length > 0) {
            return freeElements.pop();
        }
        var activeElements = this.getActiveElementsByType(type);
        if (activeElements.size < this.capacity) {
            return this.createElement();
        }
        var _a = activeElements.entries().next().value, firstClient = _a[0], firstElement = _a[1];
        activeElements.delete(firstClient);
        return firstElement;
    };
    /**
     * This function ************************************
     * @param {*} client
     * @param {*} type
     * @returns
     */
    VirtualElementPool.getElementFor = function (client, type) {
        var activeElements = this.getActiveElementsByType(type);
        if (activeElements.has(client)) {
            return activeElements.get(client);
        }
        var ve = this.allocateElement(type);
        activeElements.set(client, ve);
        return ve;
    };
    VirtualElementPool.show = function (client, type, textContent, style) {
        // console.log("VirtualElementPool.show");
        var ve = this.getElementFor(client, type);
        ve.nextTextContent = textContent;
        ve.nextStyle = style;
        VirtualElementPool.scheduleUpdate();
    };
    VirtualElementPool.hide = function (client, type) {
        var activeElements = this.getActiveElementsByType(type);
        if (activeElements.has(client)) {
            var ve = activeElements.get(client);
            // Move it out of screen
            // ve.nextStyle = { ...ve.style, transform: 'translate(-999px, -999px)' };
            // Hide the element
            ve.nextStyle = __assign(__assign({}, ve.style), { display: "none" });
            ve.nextTextContent = "";
            VirtualElementPool.scheduleUpdate();
            activeElements.delete(client);
            this.getFreeElementsByType(type).push(ve);
        }
    };
    VirtualElementPool.clear = function () {
        for (var _i = 0, _a = this.activeElements; _i < _a.length; _i++) {
            var _b = _a[_i], owner = _b[0], ownElements = _b[1];
            for (var _c = 0, ownElements_1 = ownElements; _c < ownElements_1.length; _c++) {
                var _d = ownElements_1[_c], key = _d[0], element = _d[1];
                element.native.remove();
            }
        }
        this.allElements = [];
        this.activeElements.clear();
    };
    /**
     * Represents a void DOM element.
     */
    VirtualElementPool.capacity = 400;
    VirtualElementPool.allElements = [];
    VirtualElementPool.activeElements = new Map();
    VirtualElementPool.freeElements = new Map();
    VirtualElementPool.updateScheduled = false;
    return VirtualElementPool;
}());
exports.VirtualElementPool = VirtualElementPool;
