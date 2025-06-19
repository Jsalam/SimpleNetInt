import { gp5 } from "../../../main";
import { VNode } from "../../../visualElements/vNode";
import { CustomEvent } from "../../../types";

/**
 * The item is a simplier representation of a vNode that does not have connectors and cannot be linked to other vNodes or items
 */

export class Item {
    vNode: VNode;
    label: string;
    value: number; // The value associated with the item, can be a number or a string
    width: number;
    height: number;
    classID: string;
    svgNS: string;
    element: SVGElement | undefined;

    constructor(vNode: VNode) {
        this.vNode = vNode;
        this.label = vNode.node.label;
        this.value = Math.random() * 1; // Use the length of the word as the value
        this.width = 0;
        this.height = 0;
        this.classID = this.label.replace(/[^a-zA-Z0-9.]/g, '_').replace(/\./g, '_');
        this.svgNS = "http://www.w3.org/2000/svg";
        this.element;
        //
        vNode.subscribe(this)
    }

    /**
     * 
     * @param data the data to update the item with
     * This method is called when the vNode is updated
     */
    fromVNode(data: CustomEvent): void {
        // This method is called when the vNode is updated
        // You can check the event type or use data.detail for custom data
        if (data.event instanceof MouseEvent) {

            // Trigger an event of the HTML element that represents this item
            if (data.event.type === 'mouseover') {
                this.element?.dispatchEvent(data.event);

            } else if (data.event.type === 'mouseout') {
                this.element?.dispatchEvent(data.event);
            }
        } else if (data.event instanceof KeyboardEvent) {
            // do something
        } else {
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
    makeBarGroup(xStep: number, yPos: number, index: number, minValue: number, maxValue: number) {
        // create a group for each item
        let group = document.createElementNS(this.svgNS, 'g');
        //  group.setAttribute('class', this.classID); // Replace spaces with underscores for valid ID
        // Remove all non-alphanumeric characters and periods, replace with underscores
        group.setAttribute('class', "itemGroup " + this.classID);// Replace spaces with underscores for valid ID

        /**
         * THERE IS A PROBLE HERE WITH THE TYPE OF VALUE. SOMETIMES IT IS A STRING AND SOMETIMES A NUMBER. WE NEED TO 
         * HANDLE THIS CASE.
         */
        let y: number = this.value;
        if (minValue == maxValue) { y = yPos - this.value } else { y = yPos - gp5.map(this.value, minValue, maxValue, 5, yPos) }; // Scale the height for visibility

        // Create a line and label
        let lineSegment = this.makeLineSegment(index, xStep, yPos, y);
        let segmentLabel = this.makeSegmentLabel(index, xStep, yPos);

        // add the to SVG
        group.appendChild(segmentLabel);
        group.appendChild(lineSegment);

        // Activeate hover events
        this.element = group as SVGElement; // Store the group element in the item
        this.subscribeMouseEvents(this.element);
        return group;
    }

    makeLineSegment(index: number, xStep: number, yPos: number, y: number) {
        let line = document.createElementNS(this.svgNS, 'line');
        line.setAttribute('class', 'line-style');
        line.setAttribute('x1', (index * xStep + xStep / 2).toString());
        line.setAttribute('y1', yPos.toString());
        line.setAttribute('x2', (index * xStep + xStep / 2).toString());
        line.setAttribute('y2', y.toString()); // Scale the height for visibility
        return line;
    }

    makeSegmentLabel(index: number, xStep: number, yPos: number) {
        let text = document.createElementNS(this.svgNS, 'text');
        text.setAttribute('class', 'textLabel');
        text.setAttribute('x', (index * xStep + xStep / 2).toString());
        text.setAttribute('y', yPos.toString()); // Position below the line

        text.textContent = this.label;
        text.setAttribute('transform', `rotate(-90, ${index * xStep + xStep / 2}, ${yPos + 5})`);
        text.setAttribute('dy', '8'); // Leave a 5px gap
        text.setAttribute('text-anchor', 'end'); // Justify to the top
        return text;
    }

    /** GETTERS */
    getNumChars() {
        return this.label.length; // Return the number of characters in the word
    }

    getValue(): number {
        return this.value; // Return the value associated with the word
    }


    /** LISTENERS */

    subscribeMouseEvents(element: HTMLElement | SVGElement): void {

        let matchingGroups: NodeListOf<SVGElement>;

        element.addEventListener('mouseover', () => {
            matchingGroups = document.querySelectorAll(`.${this.classID}`);

            // Highlight all the instances of the matching group
            matchingGroups.forEach((group: SVGElement) => {

                // evalute if the group is a <g> element
                if (group.tagName.toLowerCase() == 'g') {

                    let line = group.querySelector('.line-style') as SVGLineElement | null;
                    let text = group.querySelector('.textLabel') as SVGTextElement | null;

                    if (line) {
                        (line as SVGLineElement).style.stroke = '#ff0000';
                        (line as SVGLineElement).style.strokeWidth = '3px'; // Increase line width
                    }
                    if (text) {
                        (text as SVGTextElement).style.fill = '#ff0000'; // Change text color to red
                        (text as SVGTextElement).style.fontSize = '18px'; // Make text bold
                    }
                } else {
                    (group as SVGElement).style.color = '#ff0000';
                    (group as SVGElement).style.backgroundColor = 'pink'; // Change background color to light grey
                }
            });
        });

        element.addEventListener('mouseout', () => {
            matchingGroups = document.querySelectorAll(`.${this.classID}`);
            // Highlight all the instances of the matching group
            matchingGroups.forEach((group: SVGElement) => {
                // evalute if the group is a <g> element
                if (group.tagName.toLowerCase() == 'g') {
                    let line = group.querySelector('.line-style') as SVGLineElement | null;
                    let text = group.querySelector('.textLabel') as SVGTextElement | null;
                    if (line) {
                        (line as SVGLineElement).style.stroke = '#9E9E9E';
                        (line as SVGLineElement).style.strokeWidth = '1px';
                    }; // Reset line color
                    if (text) {
                        (text as SVGTextElement).style.fill = 'darkgrey';
                        (text as SVGTextElement).style.fontSize = '12px'; // Reset text color
                    } // Reset text color
                } else {
                    (group as SVGElement).style.backgroundColor = 'seashell'; // Reset background color
                    (group as SVGElement).style.color = 'black'
                }
            });

        });

        // element.addEventListener('click', (evt: Event) => {
        //     console.log(this.vNode)
        // });
    }
}