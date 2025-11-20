"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var main_1 = require("../../../main");
/**
 * The item is a simplier representation of a vNode that does not have connectors and cannot be linked to other vNodes or items
 */
var Item = /** @class */ (function () {
    function Item(vNode) {
        this.vNode = vNode;
        this.label = String(vNode.node.label);
        this.value = Math.random() * 1; // Use the length of the word as the value
        this.width = 0;
        this.height = 0;
        this.classID = this.label
            .replace(/[^a-zA-Z0-9.]/g, "_")
            .replace(/\./g, "_");
        this.svgNS = "http://www.w3.org/2000/svg";
        this.element;
    }
    /**
     *
     * @param data the data to update the item with
     * This method is called when the vNode is updated
     */
    Item.prototype.fromVNode = function (data) {
        var _a, _b;
        // This method is called when the vNode is updated
        // You can check the event type or use data.detail for custom data
        if (data.event instanceof MouseEvent) {
            // Trigger an event of the HTML element that represents this item
            if (data.event.type === "mouseover") {
                (_a = this.element) === null || _a === void 0 ? void 0 : _a.dispatchEvent(data.event);
            }
            else if (data.event.type === "mouseout") {
                (_b = this.element) === null || _b === void 0 ? void 0 : _b.dispatchEvent(data.event);
            }
        }
        else if (data.event instanceof KeyboardEvent) {
            // do something
        }
        else {
            // do something
        }
    };
    /** MAKERS */
    /**
     *
     * @param {*} xStep the step size for the x-axis
     * @param {*} yPos the y position for the bar group
     * @param {*} index the poistion of the item in the ar chart
     * @param {*} minValue the minimum value for the chart
     * @param {*} maxValue the maximum value for the chart
     * @returns a svg group element containing the line segment and label for the bar chart item
     */
    Item.prototype.makeBarGroup = function (xStep, yPos, index, minValue, maxValue) {
        // create a group for each item
        var group = document.createElementNS(this.svgNS, "g");
        //  group.setAttribute('class', this.classID); // Replace spaces with underscores for valid ID
        // Remove all non-alphanumeric characters and periods, replace with underscores
        group.setAttribute("class", "itemGroup " + this.classID); // Replace spaces with underscores for valid ID
        /**
         * THERE IS A PROBLE HERE WITH THE TYPE OF VALUE. SOMETIMES IT IS A STRING AND SOMETIMES A NUMBER. WE NEED TO
         * HANDLE THIS CASE.
         */
        var y = this.value;
        if (minValue == maxValue) {
            y = yPos - this.value;
        }
        else {
            y = yPos - main_1.gp5.map(this.value, minValue, maxValue, 5, yPos);
        } // Scale the height for visibility
        // Create a line and label
        var lineSegment = this.makeLineSegment(index, xStep, yPos, y);
        var segmentLabel = this.makeSegmentLabel(index, xStep, yPos);
        // add the to SVG
        group.appendChild(segmentLabel);
        group.appendChild(lineSegment);
        // Activeate hover events
        this.element = group; // Store the group element in the item
        this.subscribeMouseEvents(this.element);
        return group;
    };
    Item.prototype.makeLineSegment = function (index, xStep, yPos, y) {
        var line = document.createElementNS(this.svgNS, "line");
        line.setAttribute("class", "line-style");
        line.setAttribute("x1", (index * xStep + xStep / 2).toString());
        line.setAttribute("y1", yPos.toString());
        line.setAttribute("x2", (index * xStep + xStep / 2).toString());
        line.setAttribute("y2", y.toString()); // Scale the height for visibility
        return line;
    };
    Item.prototype.makeSegmentLabel = function (index, xStep, yPos) {
        var text = document.createElementNS(this.svgNS, "text");
        text.setAttribute("class", "textLabel");
        text.setAttribute("x", (index * xStep + xStep / 2).toString());
        text.setAttribute("y", yPos.toString()); // Position below the line
        text.textContent = this.label;
        text.setAttribute("transform", "rotate(-90, ".concat(index * xStep + xStep / 2, ", ").concat(yPos + 5, ")"));
        text.setAttribute("dy", "8"); // Leave a 5px gap
        text.setAttribute("text-anchor", "end"); // Justify to the top
        return text;
    };
    /** GETTERS */
    Item.prototype.getNumChars = function () {
        return this.label.length; // Return the number of characters in the word
    };
    Item.prototype.getValue = function () {
        return this.value; // Return the value associated with the word
    };
    /** LISTENERS */
    Item.prototype.subscribeMouseEvents = function (element) {
        var _this = this;
        var matchingGroups;
        element.addEventListener("mouseover", function () {
            matchingGroups = document.querySelectorAll(".".concat(_this.classID));
            // Highlight all the instances of the matching group
            matchingGroups.forEach(function (group) {
                // evalute if the group is a <g> element
                if (group.tagName.toLowerCase() == "g") {
                    var line = group.querySelector(".line-style");
                    var text = group.querySelector(".textLabel");
                    if (line) {
                        line.style.stroke = "#ff0000";
                        line.style.strokeWidth = "3px"; // Increase line width
                    }
                    if (text) {
                        text.style.fill = "#ff0000"; // Change text color to red
                        text.style.fontSize = "18px"; // Make text bold
                    }
                }
                else {
                    group.style.color = "#ff0000";
                    group.style.backgroundColor = "pink"; // Change background color to light grey
                }
            });
        });
        element.addEventListener("mouseout", function () {
            matchingGroups = document.querySelectorAll(".".concat(_this.classID));
            // Highlight all the instances of the matching group
            matchingGroups.forEach(function (group) {
                // evalute if the group is a <g> element
                if (group.tagName.toLowerCase() == "g") {
                    var line = group.querySelector(".line-style");
                    var text = group.querySelector(".textLabel");
                    if (line) {
                        line.style.stroke = "#9E9E9E";
                        line.style.strokeWidth = "1px";
                    } // Reset line color
                    if (text) {
                        text.style.fill = "darkgrey";
                        text.style.fontSize = "12px"; // Reset text color
                    } // Reset text color
                }
                else {
                    group.style.backgroundColor = "seashell"; // Reset background color
                    group.style.color = "black";
                }
            });
        });
        // element.addEventListener('click', (evt: Event) => {
        //     console.log(this.vNode)
        // });
    };
    return Item;
}());
exports.Item = Item;
