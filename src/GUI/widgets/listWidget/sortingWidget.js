"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingWidget = void 0;
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
const quicksort_1 = require("../../../utilities/quicksort");
const DOMManager_1 = require("../../DOM/DOMManager");
const clusterFactory_1 = require("../../../factories/clusterFactory");
const settingsPanelFactory_1 = require("../../../factories/settingsPanelFactory");
const utilities_1 = require("../../../utilities/utilities");
const colorFactory_1 = require("../../../factories/colorFactory");
class SortingWidget {
    items; // The items to be sorted in the chart
    width;
    height;
    label;
    id;
    minValue;
    maxValue;
    sortingAttributes = [];
    sortingSettings;
    currentPalette;
    // constructor
    constructor(items, label, width, height) {
        this.items = items;
        width ? this.width = width : this.width = window.innerWidth - 20; // Default width if not provided
        height ? this.height = height : this.height = 70; // Default height if not provided
        this.label = label;
        this.id = `${this.label.replace(/\s+/g, '_')}_${Date.now()}`;
        // Set the sorting chart limits before creating the chart
        this.minValue = -Infinity;
        this.maxValue = Infinity;
    }
    /**
     * This method ...
    */
    updateVisuals() {
        // Update the value limits
        this.setValueLimits(this.items); // Set the limits for the chart
        // get the chart element by its ID and replace it with a new chart
        let tmpElement = DOMManager_1.DOM.elements.sortingWidgets.querySelectorAll('#' + this.id)[0];
        // Replace the old chart with the new one
        //  let replacement = this.makeChart(this.label + " | value"); // Create a new chart with the updated items
        let svg = this.makeSVG();
        let oldSVG = tmpElement.querySelector('svg');
        oldSVG?.replaceWith(svg);
        // tmpElement.innerHTML = ''; // Clear the old chart
        // tmpElement.appendChild(replacement); // Append the new chart to the old chart element
        // tmpElement.replaceWith(replacement); // Replace the old chart with the new one
    }
    /**
     * This method extracts the attributes from the vNodes and returns them as an array of strings.
     * It iterates through the vNodes and their attributes, collecting the keys of the attributes into an array.
     * This is used to determine the attributes that can be used for sorting the items in the chart.
     * @returns
     */
    getSortingAttributesFromVNodes() {
        let attributes = [];
        let path = [];
        // let index: number = -1;
        let vNodesTemp = clusterFactory_1.ClusterFactory.getVClusterByLabel(this.label).vNodes;
        // for (let i = 0; i < vNodesTemp.length; i++) {
        //     // get the vCluster name
        //     const vNode = vNodesTemp[i];
        //     const clusterName = vNode.parentVCluster?.cluster.label
        //     index = i;
        //     if (clusterName == this.label) {
        //         break
        //     }
        // }
        for (let i = 0; i < vNodesTemp.length; i++) {
            //for (let i = 0; i < 1; i++) {
            let vNode = vNodesTemp[i];
            try {
                let attrib = vNode.node.attributes?.attAll;
                if (!attrib) {
                    attrib = vNode.node.attributes;
                }
                function cllbck(datum) {
                    //   console.log(datum)
                    if (datum.path.length > 1) {
                        if (!attributes.includes(datum.path[1])) {
                            attributes.push(datum.path[1]);
                        }
                    }
                }
                if (attrib)
                    utilities_1.Utilities.traverse(attrib, cllbck, path);
                else
                    console.warn("node attributes do not have 'attAll' property. Nodes might not belong to a GEO cluster");
            }
            catch (error) {
                console.warn('Error reading the attributes of a node index: ' + i);
            }
        }
        return attributes;
    }
    makeChart(labelNew) {
        this.setValueLimits(this.items); // Set the limits for the chart
        //the container element
        let chart = document.createElement('div');
        // Replace spaces with underscores for valid ID
        chart.setAttribute('id', this.id);
        chart.setAttribute('class', 'chart');
        // the chart header
        let chartHeader = this.makeHeader(labelNew);
        let svg = this.makeSVG(); // Create the SVG element
        // Get the sorting attributes from the vNodes
        this.sortingAttributes = this.getSortingAttributesFromVNodes();
        // Create the settings panel in the provided HTML element
        this.sortingSettings = settingsPanelFactory_1.SettingsPanelFactory.add(clusterFactory_1.ClusterFactory.getVClusterByLabel(labelNew), false, chartHeader);
        // This is to change the layout elements from column to row
        let elmnt = this.sortingSettings.getDimensionControls()[0];
        elmnt.parentElement.classList.add('selectElementFlex');
        //Register the sorting listener
        this.addListenerToClusterSettings(this.sortingSettings);
        chart.appendChild(chartHeader); // Add the header
        chart.appendChild(svg); // Add the SVG
        return chart;
    }
    makeSVG() {
        // Create an SVG element using the standard DOM API
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        svg.setAttribute('width', (this.width).toString());
        svg.setAttribute('height', this.height.toString());
        svg.setAttribute('transform', 'translate(8,0)'); // add margin on the right
        // Add groups to the SVG for each item in the array
        let xStep = (this.width - 16) / this.items.length;
        let yPos = this.height;
        let groupContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        groupContainer.setAttribute('class', 'itemsContainer'); // Replace spaces with underscores for valid ID
        for (let i = 0; i < this.items.length; i++) {
            // Create a group for each item
            let group = this.items[i].makeBarGroup(xStep, yPos, i, this.minValue, this.maxValue); // Create a group for each item
            groupContainer.appendChild(group);
        }
        svg.appendChild(groupContainer); // Add the group container to the SVG
        return svg;
    }
    /**
     * Creates the HTML element with the label. This is used as the container of the
     * dropdown menus built with ClusterSettings.add()
     * @param label
     * @returns
     */
    makeHeader(label) {
        let header = document.createElement('div');
        let id = `${'header'}_${Date.now()}`;
        header.setAttribute('id', id);
        header.setAttribute('class', 'chartHeader');
        let titleLabel = this.makeTitle(label);
        header.appendChild(titleLabel);
        return header;
    }
    makeTitle(label, className = 'title') {
        let title = document.createElement('div');
        title.setAttribute('class', className);
        if (label) {
            title.innerHTML = label;
        }
        else {
            title.innerHTML = this.label;
        }
        return title;
    }
    /**
     *
     * @param items the items to set the value limits for
     * This method iterates through the items and sets the minimum and maximum values based on their values.
     */
    setValueLimits(items) {
        this.minValue = -Infinity;
        this.maxValue = Infinity;
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
            else if (value instanceof String) {
                value = value.length; // Use the length of the string as the value if it is not a number
            }
            if (value === -1)
                continue; // skip invalid values
            if (this.minValue === -Infinity || value < this.minValue) {
                this.minValue = value;
            }
            if (this.maxValue === Infinity || value > this.maxValue) {
                this.maxValue = value;
            }
        }
        console.warn("The limits of list " + this.label + " changed to Min value: " + this.minValue + ", Max value: " + this.maxValue);
    }
    /**
    *   This method adds a new item to the item list.
    *   It creates a new Item instance from the provided VNode and adds it to the items array.
    *   It also notifies all subscribed widgets about the new item.
    * @param vNode the VNode to create an Item from
    * @returns void
    */
    addItem(item) {
        this.items.push(item);
        this.updateVisuals(); // Update the visuals after adding the item
        this.setValueLimits(this.items); // Update the value limits after adding the item
    }
    /********** LISTENERS *************/
    /**
     * @param dropdown
     */
    addListenerToOneSelector(dropdown) {
        dropdown.addEventListener('change', (event) => {
            // get the selected value
            let target = event.target;
            let selectedValue = target.value; // Get the selected value from the dropdown
            let comparatorName = 'compareAlphabetically'; // Default comparator
            /**
             * I made an assumption that the items in the list have a vNode whose attribute names are
             * all the same across the vNodes. That is why I am using the first item in the list to get
             * the attributes.
             */
            for (let item of this.items) {
                // Access the attribute value from the vNode using the selectedValue as the key
                // const node = item.vNode.node;
                // let attrValue = undefined;
                // if (node.attributes) {
                //     for (const key of Object.keys(node.attributes)) {
                //         const nestedAttrs = (node.attributes as Record<string, any>)[key];
                //         // Check if the selectedValue exists in the nested attributes
                //         if (nestedAttrs && selectedValue in nestedAttrs) {
                //             attrValue = nestedAttrs[selectedValue];
                //             break;
                //         }
                //     }
                // }
                // if (attrValue !== undefined) {
                //     item.value = NaN; // Reset the value to 0 before assigning a new value
                //     console.log(`Item ${item.label} in ${selectedValue} has value: ${attrValue}`);
                //     // Determine if attrValue can be casted to a number
                //     if (!isNaN(Number(attrValue))) {
                //         console.log('before =' + item.value);
                //         item.value = Number(attrValue);
                //         console.log('after =' + item.value);
                //         // Use the numeric comparator if attrValue is a number
                //         comparatorName = "compareValue";
                //     } else {
                //         item.value = attrValue
                //         // Otherwise, use the alphabetical comparator
                //         comparatorName = 'compareAlphabetically';
                //     }
                // }
            }
            console.log("Sorting items by: " + selectedValue + " using comparator: " + comparatorName);
            //sort the array and make a new chart
            (0, quicksort_1.quickSort)(this.items, 0, this.items.length - 1, comparatorName, "value"); // Sort the items based on the selected criteria
            this.updateVisuals();
        });
    }
    addListenerToClusterSettings(settings) {
        for (const dropdown of settings.getDimensionControls()) {
            dropdown.addEventListener('change', (event) => {
                this.runSorting(settings);
            });
        }
        settings.getYearControl().addEventListener('change', (event) => {
            this.runSorting(settings);
        });
    }
    runSorting(settings) {
        // get the selected value
        const currentSelectionInSettingsPanel = settings.getCurrentSelection();
        if (!currentSelectionInSettingsPanel || currentSelectionInSettingsPanel.length === 0) {
            // nothing selected, abort sorting
            return;
        }
        const selectedValue = currentSelectionInSettingsPanel.at(-1); // Get the selected value from the dropdown
        let comparatorName = 'compareAlphabetically'; // Default comparator
        // get the index of the vNode corresponding to the widget vCluster. Use the Widget label
        // let index: number = -1;
        let vNodesTemp = clusterFactory_1.ClusterFactory.getVClusterByLabel(this.label).vNodes;
        // for (let i = 0; i < this.items[0].vNodes.length; i++) {
        //     // get the vCluster name
        //     const vNode = this.items[0].vNodes[i];
        //     const clusterName = vNode.parentVCluster?.cluster.label
        //     index = i;
        //     if (clusterName == this.label) break
        // }
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            let attributes;
            let attrValue = undefined;
            try {
                // Access the attribute value from the vNode using the selectedValue as the key
                attributes = item.vNode.node.attributes?.attAll;
                if (!attributes) {
                    attributes = item.vNode.node.attributes;
                }
            }
            catch (error) {
                console.warn('item at ' + i + ' does not have ' + this.label + ' data');
            }
            if (attributes) {
                let path = [];
                let index = 0;
                let year = settings.getYearControl().value;
                if (year == '2004-2008' || year == '2006' || year == '2000')
                    index = 0;
                if (year == '2015-2019' || year == '2017' || year == '2010')
                    index = 1;
                try {
                    utilities_1.Utilities.traverse(Object.values(attributes)[index], (datum) => {
                        if (datum.key == selectedValue) {
                            attrValue = datum.value;
                            this.currentPalette = colorFactory_1.ColorFactory.getSequentialPalette(datum.key);
                            return;
                        }
                    }, path);
                }
                catch (error) {
                    console.warn(attributes.municipality + ' has settings different than other municipalities');
                }
            }
            // console.log('attr value ' + attrValue)
            if (attrValue !== undefined) {
                item.value = NaN; // Reset the value to 0 before assigning a new value
                // console.log(`Item ${item.label} in ${selectedValue} has value: ${attrValue}`);
                // Determine if attrValue can be casted to a number
                if (!isNaN(Number(attrValue))) {
                    //console.log('before =' + item.value);
                    item.value = Number(attrValue);
                    // assign a color corresponding to the value 
                    item.palette = this.currentPalette;
                    //console.log('after =' + item.value);
                    // Use the numeric comparator if attrValue is a number
                    comparatorName = "compareValue";
                }
                else {
                    item.value = attrValue;
                    // Otherwise, use the alphabetical comparator
                    comparatorName = 'compareAlphabetically';
                }
            }
            else {
                //  console.warn('selected value "' + selectedValue + '" not found in node attributes')
            }
        }
        // console.log("Trying to sort items by: " + selectedValue + " using comparator: " + comparatorName);
        //sort the array and make a new chart
        (0, quicksort_1.quickSort)(this.items, 0, this.items.length - 1, comparatorName, "value"); // Sort the items based on the selected criteria
        //TODO : ************ create a function that takes the list of items and assign a mapped color by
        // this.currentPalette to each item. The color is for items  to the be used when rendered
        this.updateVisuals();
    }
}
exports.SortingWidget = SortingWidget;
//# sourceMappingURL=sortingWidget.js.map