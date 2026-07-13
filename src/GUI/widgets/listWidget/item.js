"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const main_1 = require("../../../main");
/**
 * The item is a simplier representation of a vNode that does not have connectors and cannot be linked to other vNodes or items
 */
class Item {
    vNode;
    label;
    value; // The value associated with the item, can be a number or a string
    width;
    height;
    classID;
    svgNS;
    element;
    normalizedValue;
    palette;
    color = "#9E9E9E";
    constructor(vNode) {
        this.vNode = vNode; // one node for each cluster in the dataset
        this.label = String(vNode.node.label);
        this.value = 0; // Math.random() * 1; // Use the length of the word as the value
        this.width = 0;
        this.height = 0;
        this.classID = 'ID' + String(vNode.node.idCat.index) //this.label
            .replace(/[^a-zA-Z0-9.]/g, "_")
            .replace(/\./g, "_");
        this.svgNS = "http://www.w3.org/2000/svg";
        this.element;
    }
    setValue(newValue) {
        this.value = newValue;
    }
    /**
     *
     * @param data the data to update the item with
     * This method is called when the vNode is updated
     */
    fromVNode(data) {
        // This method is called when the vNode is updated
        // You can check the event type or use data.detail for custom data
        if (data.event instanceof MouseEvent) {
            // Trigger an event of the HTML element that represents this item
            if (data.event.type === "mouseover") {
                this.element?.dispatchEvent(data.event);
            }
            else if (data.event.type === "mouseout") {
                this.element?.dispatchEvent(data.event);
            }
        }
        else if (data.event instanceof KeyboardEvent) {
            // do something
        }
        else {
            // do something
        }
    }
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
    makeBarGroup(xStep, yPos, index, minValue, maxValue) {
        // create a group for each item
        let group = document.createElementNS(this.svgNS, "g");
        //  group.setAttribute('class', this.classID); // Replace spaces with underscores for valid ID
        // Remove all non-alphanumeric characters and periods, replace with underscores
        group.setAttribute("class", "itemGroup " + this.classID); // Replace spaces with underscores for valid ID
        /**
         * THERE IS A PROBLE HERE WITH THE TYPE OF VALUE. SOMETIMES IT IS A STRING AND SOMETIMES A NUMBER. WE NEED TO
         * HANDLE THIS CASE.
         */
        let y = this.value;
        if (minValue == maxValue) {
            y = yPos - this.value;
        }
        else {
            // store normalized value
            this.normalizedValue = main_1.gp5.map(this.value, minValue, maxValue, 0, 1);
            y = (yPos - this.normalizedValue * yPos) + 1; // 1 added to make the item height at least 1 px.
        }
        // set the stroke color to this item
        if (this.palette)
            this.color = this.palette(this.normalizedValue).hex();
        // Create a line and label
        let lineSegment = this.makeLineSegment(index, xStep, yPos, y);
        let segmentLabel = this.makeSegmentLabel(index, xStep, yPos);
        // add the to SVG
        group.appendChild(segmentLabel);
        group.appendChild(lineSegment);
        // Activeate hover events
        this.element = group; // Store the group element in the item
        this.subscribeMouseEvents(this.element);
        return group;
    }
    makeLineSegment(index, xStep, yPos, y) {
        let line = document.createElementNS(this.svgNS, "line");
        line.setAttribute("class", "line-style");
        line.setAttribute("x1", (index * xStep + xStep / 2).toString());
        line.setAttribute("y1", yPos.toString());
        line.setAttribute("x2", (index * xStep + xStep / 2).toString());
        line.setAttribute("y2", y.toString()); // Scale the height for visibility
        line.setAttribute("stroke", this.color);
        return line;
    }
    makeSegmentLabel(index, xStep, yPos) {
        let text = document.createElementNS(this.svgNS, "text");
        text.setAttribute("class", "textLabel");
        text.setAttribute("x", (index * xStep + xStep / 2).toString());
        text.setAttribute("y", yPos.toString()); // Position below the line
        text.textContent = this.label;
        text.setAttribute("transform", `rotate(-90, ${index * xStep + xStep / 2}, ${yPos + 5}) translate(10, 0)`);
        text.setAttribute("dy", "8"); // Leave a 5px gap
        text.setAttribute("text-anchor", "start"); // Justify to the top
        //text.setAttribute('display', 'none')
        return text;
    }
    /** GETTERS */
    getNumChars() {
        return this.label.length; // Return the number of characters in the word
    }
    getValue() {
        return this.value; // Return the value associated with the word
    }
    /** LISTENERS */
    subscribeMouseEvents(element) {
        let matchingGroups;
        element.addEventListener("mouseover", () => {
            matchingGroups = document.querySelectorAll(`.${this.classID}`);
            // console.log(this.vNode)
            this.vNode.highlight(true);
            // Highlight all the instances of the matching group
            matchingGroups.forEach((group) => {
                // evalute if the group is a <g> element
                if (group.tagName.toLowerCase() == "g") {
                    let line = group.querySelector(".line-style");
                    let text = group.querySelector(".textLabel");
                    if (line) {
                        line.style.stroke = "rgb(158, 175, 1)";
                        line.style.strokeWidth = "3px"; // Increase line width
                        line.style.display = 'none';
                    }
                    if (text) {
                        text.style.display = 'block';
                        text.style.fill = "rgb(182, 202, 4)"; // Change text color to red
                        text.style.fontSize = "12px"; // Make text bold
                        text.style.width = "200px";
                    }
                }
                else {
                    group.style.color = "#ff0000";
                    group.style.backgroundColor = "pink"; // Change background color to light grey
                }
            });
        });
        element.addEventListener("mouseout", () => {
            matchingGroups = document.querySelectorAll(`.${this.classID}`);
            // Highlight all the instances of the matching group
            this.vNode.highlight(false);
            matchingGroups.forEach((group) => {
                // evalute if the group is a <g> element
                if (group.tagName.toLowerCase() == "g") {
                    let line = group.querySelector(".line-style");
                    let text = group.querySelector(".textLabel");
                    if (line) {
                        // (line as SVGLineElement).style.stroke = "#9E9E9E";
                        line.style.stroke = this.color;
                        line.style.strokeWidth = "1px";
                        line.style.display = 'block';
                    } // Reset line color
                    if (text) {
                        text.style.fill = "rgba(169, 163, 163, 0.315)";
                        text.style.fontSize = "6px"; // Reset text color
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
    }
}
exports.Item = Item;
//# sourceMappingURL=item.js.map