import { gp5 } from "../../../main";
import { VNode } from "../../../visualElements/vNode";

/**
 * The item is a simplier representation of a vNode that does not have connectors and cannot be linked to other vNodes or items
 */

export class Item {
    vNode: VNode;
    label: string;
    value: number;
    width: number;
    height: number;
    classID: string;
    svgNS: string;

    constructor(vNode: VNode) {
        this.vNode = vNode;
        this.label = vNode.node.label;
        this.value = Math.random() * 1; // Use the length of the word as the value
        this.width = 0;
        this.height = 0;
        this.classID = this.label.replace(/\s+/g, '_')
        this.svgNS = "http://www.w3.org/2000/svg";
    }


    /** GETTERS */

    getDivGroup() {
        const cell = document.createElement('div');
        cell.className = this.label.replace(/\s+/g, '_');
        cell.style.backgroundColor = 'white';
        cell.style.fontSize = '0.5em'; // Set a smaller font size for better visibility
        cell.style.fontFamily = 'sans-serif';
        cell.style.textAlign = 'center';
        cell.innerHTML = this.label; // Fill the cell with the corresponding element or leave it empty if out of bounds
        // place the cell in the grid by the row and column
        this.subscribeMouseEvents(cell);
        return cell

    }

    /**
     * 
     * @param {*} xStep the step size for the x-axis
     * @param {*} yPos the y position for the bar group
     * @param {*} index the poistion of the item in the ar chart
     * @param {*} minValue the minimum value for the chart
     * @param {*} maxValue the maximum value for the chart
     * @returns a svg group element containing the line segment and label for the bar chart item
     */
    getBarGroup(xStep: number, yPos: number, index: number, minValue: number, maxValue: number) {
        // create a group for each item
        let group = document.createElementNS(this.svgNS, 'g');
        //  group.setAttribute('class', this.classID); // Replace spaces with underscores for valid ID
        group.setAttribute('class', "itemGroup"); // Replace spaces with underscores for valid ID

        let y: number;
        if (minValue == maxValue) { y = this.value } else { y = yPos - gp5.map(this.value, minValue, maxValue, 5, yPos) }; // Scale the height for visibility

        // Create a line and label
        let lineSegment = this.getLineSegment(index, xStep, yPos, y);
        let segmentLabel = this.getSegmentLabel(index, xStep, yPos);

        // add the to SVG
        group.appendChild(segmentLabel);
        group.appendChild(lineSegment);

        // Activeate hover events
        this.subscribeMouseEvents(group as SVGElement);
        return group;
    }

    getLineSegment(index: number, xStep: number, yPos: number, y: number) {
        let line = document.createElementNS(this.svgNS, 'line');
        line.setAttribute('class', 'line-style');
        line.setAttribute('x1', (index * xStep + xStep / 2).toString());
        line.setAttribute('y1', yPos.toString());
        line.setAttribute('x2', (index * xStep + xStep / 2).toString());
        line.setAttribute('y2', y.toString()); // Scale the height for visibility
        return line;
    }

    getSegmentLabel(index: number, xStep: number, yPos: number) {
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

    getNumChars() {
        return this.label.length; // Return the number of characters in the word
    }

    getValue() {
        return this.value; // Return the value associated with the word
    }


    /** LISTENERS */

    subscribeMouseEvents(element: HTMLElement | SVGElement): void {

        // let matchingGroups: NodeListOf<SVGElement>;

        // element.addEventListener('mouseover', () => {
        //     matchingGroups = document.querySelectorAll(`.${this.classID}`);

        //     // Highlight all the instances of the matching group
        //     matchingGroups.forEach((group: SVGElement) => {

        //         // evalute if the group is a <g> element
        //         if (group.tagName.toLowerCase() == 'g') {

        //             let line = group.querySelector('.line-style') as SVGLineElement | null;
        //             let text = group.querySelector('.textLabel') as SVGTextElement | null;

        //             if (line) {
        //                 (line as SVGLineElement).style.stroke = '#ff0000';
        //                 (line as SVGLineElement).style.strokeWidth = '3px'; // Increase line width
        //             }
        //             if (text) {
        //                 (text as SVGTextElement).style.fill = '#ff0000'; // Change text color to red
        //                 (text as SVGTextElement).style.fontSize = '18px'; // Make text bold
        //             }
        //         } else {
        //             (group as SVGElement).style.color = '#ff0000';
        //             (group as SVGElement).style.backgroundColor = 'pink'; // Change background color to light grey
        //         }
        //     });
        // });

        // element.addEventListener('mouseout', () => {
        //     matchingGroups = document.querySelectorAll(`.${this.classID}`);
        //     // Highlight all the instances of the matching group
        //     matchingGroups.forEach((group: SVGElement) => {
        //         // evalute if the group is a <g> element
        //         if (group.tagName.toLowerCase() == 'g') {
        //             let line = group.querySelector('.line-style') as SVGLineElement | null;
        //             let text = group.querySelector('.textLabel') as SVGTextElement | null;
        //             if (line) {
        //                 (line as SVGLineElement).style.stroke = 'black';
        //                 (line as SVGLineElement).style.strokeWidth = '1px';
        //             }; // Reset line color
        //             if (text) {
        //                 (text as SVGTextElement).style.fill = 'darkgrey';
        //                 (text as SVGTextElement).style.fontSize = '12px'; // Reset text color
        //             } // Reset text color
        //         } else {
        //             (group as SVGElement).style.backgroundColor = 'seashell'; // Reset background color
        //             (group as SVGElement).style.color = 'black'
        //         }
        //     });

        // });

        // element.addEventListener('click', (evt: Event) => {
        //     console.log(evt.target)
        //     // @ts-expect-error: parentNode may not exist or may not have parentNode
        //     console.log(evt.target.parentNode.parentNode)
        // });
    }
}