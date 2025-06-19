
/**
 * @name SortingWidget class
 * @description This class is used to create a sorting widget that displays a chart of items that can be sorted based on their attributes.
 * It provides methods to create the chart, update the visuals, and set value limits for the items.
 * It also includes methods to handle user interactions, such as selecting sorting attributes from a dropdown menu.
 * The chart is created using SVG elements and can be updated dynamically based on user input.
 * The sorting widget can be used to visualize and sort items based on their attributes, making it a useful tool for data analysis and visualization.
 * @author Juan Salamanca
 * @version 1.0.0
 */
import { quickSort } from '../../../utilities/quicksort';
import { Item } from './item';
import { DOM } from '../../DOM/DOMManager';
import { Comparator } from "../../../utilities/comparator";

export class SortingWidget {
    items: Item[]; // The items to be sorted in the chart
    width: number;
    height: number;
    label: string;
    id: string;
    minValue: number | undefined;
    maxValue: number | undefined;
    sortingAttributes: string[] = [];

    // constructor
    constructor(items: Item[], label: string, width?: number, height?: number) {
        this.items = items;
        width ? this.width = width : this.width = window.innerWidth - 200; // Default width if not provided
        height ? this.height = height : this.height = 70; // Default height if not provided
        this.label = label;
        this.id = `${this.label.replace(/\s+/g, '_')}_${Date.now()}`;

        // Set the sorting chart limits before creating the chart
        this.minValue = undefined;
        this.maxValue = undefined;
    }

    /** 
     * This method is used mainly by the getData() function in the addNodeModalForm file
    */
    updateVisuals() {
        // Update the value limits
        this.setValueLimits(this.items); // Set the limits for the chart
        // get the chart element by its ID and replace it with a new chart
        let tmpElement = DOM.elements.sortingWidgets.querySelectorAll('#' + this.id)[0] as HTMLElement;
        // Replace the old chart with the new one
        let replacement = this.makeChart(this.label + " | value"); // Create a new chart with the updated items
       // tmpElement.innerHTML = ''; // Clear the old chart
        tmpElement.appendChild(replacement); // Append the new chart to the old chart element
      //  tmpElement.replaceWith(replacement); // Replace the old chart with the new one

        console.log(replacement)
    }

    /**
     * @param vNodes the vNodes to get the sorting attributes from
     * This method extracts the attributes from the vNodes and returns them as an array of strings.
     * It iterates through the vNodes and their attributes, collecting the keys of the attributes into an array.
     * This is used to determine the attributes that can be used for sorting the items in the chart.
     * @returns 
     */
    private getSortingAttributes() {
        let attributes: string[] = [];
        for (let i = 0; i < this.items.length; i++) {
            let vNode = this.items[i].vNode;
            let topKeys: string[] = vNode.node.attributes ? Object.keys(vNode.node.attributes) : [];
            // push the topkeys to the attributes array if they are not already included
            if (vNode.node.attributes) {
                for (let key of topKeys) {
                    // Use type assertion or update NodeAttributes type if possible
                    const attrValue = (vNode.node.attributes as Record<string, any>)[key];
                    let nextKeys: string[] = attrValue ? Object.keys(attrValue) : [];
                    for (let j = 0; j < nextKeys.length; j++) {
                        if (!attributes.includes(nextKeys[j])) {
                            attributes.push(nextKeys[j]);

                        }
                    }
                }
            }
        }
        return attributes;
    }

    makeChart(labelNew?: string) {
        this.setValueLimits(this.items); // Set the limits for the chart
        //the container element
        let chart = document.createElement('div');
        chart.setAttribute('id', this.id); // Replace spaces with underscores for valid ID
        chart.setAttribute('class', 'chart');

        // the chart header
        let chartHeader = this.makeHeader(labelNew ?? this.label); // Create the header

        let svg: SVGElement = this.makeSVG(); // Create the SVG element

        // Get the sorting attributes from the vNodes
        this.sortingAttributes = this.getSortingAttributes();

        let attributesDropdown = DOM.createDropdown(this.sortingAttributes, 'att', 'sorting_dropdown', this.id + "_sorting"); // Create a dropdown for sorting attributes

        this.addListener(attributesDropdown)

        chartHeader.appendChild(attributesDropdown); // Add the dropdown to the header

        chart.appendChild(chartHeader); // Add the header

        chart.appendChild(svg); // Add the SVG

        return chart;
    }

    private makeSVG(): SVGElement {
        // Create an SVG element using the standard DOM API
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        svg.setAttribute('width', this.width.toString());
        svg.setAttribute('height', this.height.toString());

        // Add groups to the SVG for each item in the array
        let xStep = this.width / this.items.length;
        let yPos = this.height / 2;
        let groupContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        groupContainer.setAttribute('class', 'itemsContainer'); // Replace spaces with underscores for valid ID

        for (let i = 0; i < this.items.length; i++) {
            // Create a group for each item
            let group = this.items[i].makeBarGroup(xStep, yPos, i, this.minValue!, this.maxValue!); // Create a group for each item
            groupContainer.appendChild(group);
        }
        svg.appendChild(groupContainer); // Add the group container to the SVG
        return svg
    }

    private makeHeader(label?: string) {
        let header = document.createElement('div');
        header.setAttribute('class', 'chartHeader');
        let titleLabel = this.makeTitle(label);
        header.appendChild(titleLabel);
        return header;
    }

    private makeTitle(label?: string, className = 'title') {
        let title = document.createElement('div');
        title.setAttribute('class', className);
        if (label) {
            title.innerHTML = label;
        } else {
            title.innerHTML = this.label
        }
        return title;
    }


    /**
     * 
     * @param items the items to set the value limits for
     * This method iterates through the items and sets the minimum and maximum values based on their values.
     */
    private setValueLimits(items: Item[]) {
        this.minValue = undefined;
        this.maxValue = undefined;
        /**
         * WHEN THE CASE IS ABOUT STRINGS, THE MIN AND MAX VALUES ARE SET TO THE LENGTH OF THE STRING
         * WHEN THE CASE IS ABOUT NUMBERS, THE MIN AND MAX VALUES ARE SET TO THE NUMBER ITSELF
         * THIS IS A TEMPORARY SOLUTION, AND IT SHOULD BE REPLACED WITH A BETTER SOLUTION IN THE FUTURE
         * THIS IS BECAUSE THE ITEMS CAN HAVE DIFFERENT TYPES OF VALUES, AND WE NEED TO HANDLE THEM PROPERLY
         */
        for (let item of items) {
            let value = item.getValue();
            // Check if value can be casted as a number
            if (!isNaN(Number(value))) {
                value = Number(value);
            } 
            // else if (value instanceof  String) {
            //     value = value.length; // Use the length of the string as the value if it is not a number
            // }
            if (this.minValue === undefined || value < this.minValue) {
                this.minValue = value;
            }
            if (this.maxValue === undefined || value > this.maxValue) {
                this.maxValue = value;
            }
        }
        //  console.warn("The limits of list " + this.label + " changed to Min value: " + this.minValue + ", Max value: " + this.maxValue);
    }

    /**
 *   This method adds a new item to the item list.
 *   It creates a new Item instance from the provided VNode and adds it to the items array.
 *   It also notifies all subscribed widgets about the new item.
 * @param vNode the VNode to create an Item from
 * @returns void
 */
    addItem(item: Item) {
        this.items.push(item);
        this.updateVisuals(); // Update the visuals after adding the item
        this.setValueLimits(this.items); // Update the value limits after adding the item
    }

    /********** LISTENERS *************/
    /**
     * @param dropdown 
     */
    private addListener(dropdown: HTMLSelectElement) {

        dropdown.addEventListener('change', (event: Event) => {

            // get the selected value
            let target = (event.target as HTMLSelectElement);
            let selectedValue = target.value; // Get the selected value from the dropdown
            let comparatorName: string = 'compareAlphabetically'; // Default comparator

            /**
             * I made an assumption that the items in the list have a vNode whose attribute names are 
             * all the same across the vNodes. That is why I am using the first item in the list to get 
             * the attributes.
             */
            for (let item of this.items) {
                // Access the attribute value from the vNode using the selectedValue as the key
                const node = item.vNode.node;
                let attrValue = undefined;
                if (node.attributes) {
                    for (const key of Object.keys(node.attributes)) {
                        const nestedAttrs = (node.attributes as Record<string, any>)[key];

                        // Check if the selectedValue exists in the nested attributes
                        if (nestedAttrs && selectedValue in nestedAttrs) {
                            attrValue = nestedAttrs[selectedValue];
                            break;
                        }
                    }
                }

                if (attrValue !== undefined) {
                    item.value = NaN; // Reset the value to 0 before assigning a new value

                    console.log(`Item ${item.label} in ${selectedValue} has value: ${attrValue}`);
                    // Determine if attrValue can be casted to a number
                    if (!isNaN(Number(attrValue))) {
                         console.log('before ='+ item.value);
                        item.value = Number(attrValue);
                        console.log('after ='+item.value);
                        // Use the numeric comparator if attrValue is a number
                        comparatorName = "compareValue";
                    } else {
                        item.value = attrValue                        
                        // Otherwise, use the alphabetical comparator
                        comparatorName = 'compareAlphabetically';
                    }
                }
            }

            console.log("Sorting items by: " + selectedValue + " using comparator: " + comparatorName);

            //sort the array and make a new chart
            quickSort(this.items, 0, this.items.length - 1, comparatorName, "value"); // Sort the items based on the selected criteria

            this.updateVisuals()

            console.log(this.minValue + " " + this.maxValue);
        });
    }
}
