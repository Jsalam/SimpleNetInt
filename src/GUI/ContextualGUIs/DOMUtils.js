"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createElement = createElement;
exports.createInputElement = createInputElement;
exports.createSelectElement = createSelectElement;
exports.updateSelectOptions = updateSelectOptions;
function createElement(tag, style, className, properties, ...children) {
    const el = document.createElement(tag);
    Object.assign(el.style, style);
    Object.assign(el, properties);
    if (className) {
        el.className = className;
    }
    for (const child of children) {
        el.append(child);
    }
    return el;
}
function createInputElement(style, properties) {
    const el = document.createElement("input");
    Object.assign(el.style, style);
    Object.assign(el, properties);
    return el;
}
function createSelectElement(options, style, className, properties, name) {
    const el = document.createElement("select");
    for (const o of options) {
        const option = document.createElement("option");
        option.value = o.value;
        option.textContent = o.name;
        el.append(option);
    }
    Object.assign(el.style, style);
    Object.assign(el, properties);
    if (className) {
        el.className = className;
    }
    if (name) {
        el.name = name;
    }
    return el;
}
function updateSelectOptions(el, options, elementName) {
    el.innerHTML = "";
    if (elementName)
        el.name = elementName;
    for (const o of options) {
        const option = document.createElement("option");
        option.value = o.value;
        option.textContent = o.name;
        el.append(option);
    }
}
//# sourceMappingURL=DOMUtils.js.map