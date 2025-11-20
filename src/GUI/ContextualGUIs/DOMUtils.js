"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createElement = createElement;
exports.createInputElement = createInputElement;
exports.createSelectElement = createSelectElement;
exports.updateSelectOptions = updateSelectOptions;
function createElement(tag, style, properties) {
    var children = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        children[_i - 3] = arguments[_i];
    }
    var el = document.createElement(tag);
    Object.assign(el.style, style);
    Object.assign(el, properties);
    for (var _a = 0, children_1 = children; _a < children_1.length; _a++) {
        var child = children_1[_a];
        el.append(child);
    }
    return el;
}
function createInputElement(style, properties) {
    var el = document.createElement("input");
    Object.assign(el.style, style);
    Object.assign(el, properties);
    return el;
}
function createSelectElement(options, style, properties) {
    var el = document.createElement("select");
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var o = options_1[_i];
        var option = document.createElement("option");
        option.value = o.value;
        option.textContent = o.name;
        el.append(option);
    }
    Object.assign(el.style, style);
    Object.assign(el, properties);
    return el;
}
function updateSelectOptions(el, options) {
    el.innerHTML = "";
    for (var _i = 0, options_2 = options; _i < options_2.length; _i++) {
        var o = options_2[_i];
        var option = document.createElement("option");
        option.value = o.value;
        option.textContent = o.name;
        el.append(option);
    }
}
