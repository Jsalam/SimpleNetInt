
/**
 * Get a list of nodes to be sorted. This is achieved by accessing the nodes included in a cluster. Thus, we need to
 * reach the ClusterFactory, ask for one of clusters, and then get the nodes from that cluster. 
 */
import { VNode } from '../../../visualElements/vNode';
import { quickSort } from '../../../utilities/quicksort';
import { Item } from './item';
import { DOM } from '../../DOM/DOMManager';
import { Comparator } from "../../../utilities/comparator";
import { ItemList } from './itemList';

export class SortingWidget {
    itemList: ItemList | undefined;
    width: number;
    height: number;
    label: string;
    id: string;
    minValue: number | undefined;
    maxValue: number | undefined;
    sortingAttributes: string[] = [];

    // constructor
    constructor(label: string, width?: number, height?: number) {
        this.itemList;
        width ? this.width = width : this.width = window.innerWidth - 200; // Default width if not provided
        height ? this.height = height : this.height = 150; // Default height if not provided
        this.label = label;
        this.id = `${this.label.replace(/\s+/g, '_')}_${Date.now()}`;

        // Set the sorting chart limits before creating the chart
        this.minValue = undefined;
        this.maxValue = undefined;
    }

    subscribe(itemList: ItemList) {
        this.itemList = itemList;

        // Update the value limits
        this.setValueLimits(this.itemList.items);
    }

    /**
     * This method is used to notify the sorting list about changes in the item list
     * @param obj the object to notify the sorting list about
     */
    fromItemList(obj: any) {

        if (obj instanceof Item) {
            this.updateVisuals(); // Add the item to the sorting list
        }
    }

    /** 
     * This method is used mainly by the getData() function in the addNodeModalForm file
    */
    updateVisuals() {
        // Update the value limits
        this.setValueLimits(this.itemList!.items); // Set the limits for the chart
        // get the chart element by its ID and replace it with a new chart
        let tmpDIV = DOM.elements.sortingWidgets.querySelectorAll('#' + this.id)[0] as HTMLElement;
        // Replace the old chart with the new one
        tmpDIV.replaceWith(this.makeChart(this.label + " | value")); // Replace the old chart with the new one
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
        for (let i = 0; i < this.itemList!.items.length; i++) {
            let vNode = this.itemList!.items[i].vNode;
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
        let xStep = this.width / this.itemList!.items.length;
        let yPos = this.height / 2;
        let groupContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        groupContainer.setAttribute('class', 'itemsContainer'); // Replace spaces with underscores for valid ID

        for (let i = 0; i < this.itemList!.items.length; i++) {
            // Create a group for each item
            let group = this.itemList!.items[i].getBarGroup(xStep, yPos, i, this.minValue!, this.maxValue!); // Create a group for each item
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
        for (let item of items) {
            let value = item.getValue();
            if (this.minValue === undefined || value < this.minValue) {
                this.minValue = value;
            }
            if (this.maxValue === undefined || value > this.maxValue) {
                this.maxValue = value;
            }
        }
        //  console.warn("The limits of list " + this.label + " changed to Min value: " + this.minValue + ", Max value: " + this.maxValue);
    }

    /********** LISTENERS *************/
    /**
     * @param element 
     */
    private addListener(element: HTMLSelectElement) {

        element.addEventListener('change', (event: Event) => {

            // get the selected value
            let target = (event.target as HTMLSelectElement);
            let selectedValue = target.value; // Get the selected value from the dropdown

            // Set the dropdown's selected option to the user's selection
            element.value = selectedValue;

            /**
             * Here you need to determine the comparator based on the selected value.
             * First, you need to determine if the selected attribute can be casted to a number or not.
             * If it can be casted to a number, you can use the numeric comparator.
             * If it cannot be casted to a number, you can use the string comparator.
             * You can use the Comparator class to get the appropriate comparator based on the selected value.
             */

            // get the right comparator for the value
            let comparator = Comparator.staticMethodNames[0] //; console.log("Comparators available: " + comparators);

            //sort the array and make a new chart
            quickSort(this.itemList!.items, 0, this.itemList!.items.length - 1, comparator, "value"); // Sort the items based on the selected criteria

            // get the chart element by its ID and replace it with a new chart
            let tmpDIV = DOM.elements.sortingWidgets.querySelectorAll('#' + this.id)[0] as HTMLElement;

            // Replace the old chart with the new one
            tmpDIV.children[1].replaceWith(this.makeSVG());
        });
    }
}
