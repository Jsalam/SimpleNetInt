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
var quicksort_1 = require("../../../utilities/quicksort");
var DOMManager_1 = require("../../DOM/DOMManager");
const { ClusterSettings } = require("../ClusterSettings");
var SortingWidget = /** @class */ (function () {
    // constructor
    function SortingWidget(items, label, width, height) {
        this.sortingAttributes = [];
        this.items = items;
        width ? this.width = width : this.width = window.innerWidth - 200; // Default width if not provided
        height ? this.height = height : this.height = 70; // Default height if not provided
        this.label = label;
        this.id = "".concat(this.label.replace(/\s+/g, '_'), "_").concat(Date.now());
        // Set the sorting chart limits before creating the chart
        this.minValue = undefined;
        this.maxValue = undefined;
    }
    /**
     * This method is used mainly by the getData() function in the addNodeModalForm file
    */
    SortingWidget.prototype.updateVisuals = function () {
        // Update the value limits
        this.setValueLimits(this.items); // Set the limits for the chart
        // get the chart element by its ID and replace it with a new chart
        var tmpElement = DOMManager_1.DOM.elements.sortingWidgets.querySelectorAll('#' + this.id)[0];
        // Replace the old chart with the new one
        var replacement = this.makeChart(this.label + " | value"); // Create a new chart with the updated items
        // tmpElement.innerHTML = ''; // Clear the old chart
        tmpElement.appendChild(replacement); // Append the new chart to the old chart element
        //  tmpElement.replaceWith(replacement); // Replace the old chart with the new one
        console.log(replacement);
    };
    /**
     * @param vNodes the vNodes to get the sorting attributes from
     * This method extracts the attributes from the vNodes and returns them as an array of strings.
     * It iterates through the vNodes and their attributes, collecting the keys of the attributes into an array.
     * This is used to determine the attributes that can be used for sorting the items in the chart.
     * @returns
     */
    SortingWidget.prototype.getSortingAttributes = function () {
        var attributes = [];
        for (var i = 0; i < this.items.length; i++) {
            var vNode = this.items[i].vNode;
            var topKeys = vNode.node.attributes ? Object.keys(vNode.node.attributes) : [];
            // push the topkeys to the attributes array if they are not already included
            if (vNode.node.attributes) {
                for (var _i = 0, topKeys_1 = topKeys; _i < topKeys_1.length; _i++) {
                    var key = topKeys_1[_i];
                    // Use type assertion or update NodeAttributes type if possible
                    var attrValue = vNode.node.attributes[key];
                    var nextKeys = attrValue ? Object.keys(attrValue) : [];
                    for (var j = 0; j < nextKeys.length; j++) {
                        if (!attributes.includes(nextKeys[j])) {
                            attributes.push(nextKeys[j]);
                        }
                    }
                }
            }
        }
        return attributes;
    };
    SortingWidget.prototype.makeChart = function (labelNew) {
        this.setValueLimits(this.items); // Set the limits for the chart
        //the container element
        var chart = document.createElement('div');
        chart.setAttribute('id', this.id); // Replace spaces with underscores for valid ID
        chart.setAttribute('class', 'chart');
        // the chart header
        var chartHeader = this.makeHeader(labelNew !== null && labelNew !== void 0 ? labelNew : this.label); // Create the header
        // Create the SVG element
        var svg = this.makeSVG(); 
        // Get the sorting attributes from the vNodes
        this.sortingAttributes = this.getSortingAttributes();
        // Create a dropdown for sorting attributes
        var attributesDropdown = DOMManager_1.DOM.createDropdown(this.sortingAttributes, 'att', 'sorting_dropdown', this.id + "_sorting"); 
        this.addListener(attributesDropdown);
        // Add the dropdown to the header
        chartHeader.appendChild(attributesDropdown);
        // Add the header
        chart.appendChild(chartHeader);
        // Add the SVG
        chart.appendChild(svg);
        return chart;
    };
    SortingWidget.prototype.makeSVG = function () {
        // Create an SVG element using the standard DOM API
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        svg.setAttribute('width', this.width.toString());
        svg.setAttribute('height', this.height.toString());
        // Add groups to the SVG for each item in the array
        var xStep = this.width / this.items.length;
        var yPos = this.height / 2;
        var groupContainer = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        groupContainer.setAttribute('class', 'itemsContainer'); // Replace spaces with underscores for valid ID
        for (var i = 0; i < this.items.length; i++) {
            // Create a group for each item
            var group = this.items[i].makeBarGroup(xStep, yPos, i, this.minValue, this.maxValue); // Create a group for each item
            groupContainer.appendChild(group);
        }
        svg.appendChild(groupContainer); // Add the group container to the SVG
        return svg;
    };
    SortingWidget.prototype.makeHeader = function (label) {
        var header = document.createElement('div');
        header.setAttribute('class', 'chartHeader');
        var titleLabel = this.makeTitle(label);
        header.appendChild(titleLabel);
        return header;
    };
    SortingWidget.prototype.makeTitle = function (label, className) {
        if (className === void 0) { className = 'title'; }
        var title = document.createElement('div');
        title.setAttribute('class', className);
        if (label) {
            title.innerHTML = label;
        }
        else {
            title.innerHTML = this.label;
        }
        return title;
    };
    /**
     *
     * @param items the items to set the value limits for
     * This method iterates through the items and sets the minimum and maximum values based on their values.
     */
    SortingWidget.prototype.setValueLimits = function (items) {
        this.minValue = undefined;
        this.maxValue = undefined;
        /**
         * WHEN THE CASE IS ABOUT STRINGS, THE MIN AND MAX VALUES ARE SET TO THE LENGTH OF THE STRING
         * WHEN THE CASE IS ABOUT NUMBERS, THE MIN AND MAX VALUES ARE SET TO THE NUMBER ITSELF
         * THIS IS A TEMPORARY SOLUTION, AND IT SHOULD BE REPLACED WITH A BETTER SOLUTION IN THE FUTURE
         * THIS IS BECAUSE THE ITEMS CAN HAVE DIFFERENT TYPES OF VALUES, AND WE NEED TO HANDLE THEM PROPERLY
         */
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var value = item.getValue();
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
    };
    /**
 *   This method adds a new item to the item list.
 *   It creates a new Item instance from the provided VNode and adds it to the items array.
 *   It also notifies all subscribed widgets about the new item.
 * @param vNode the VNode to create an Item from
 * @returns void
 */
    SortingWidget.prototype.addItem = function (item) {
        this.items.push(item);
        this.updateVisuals(); // Update the visuals after adding the item
        this.setValueLimits(this.items); // Update the value limits after adding the item
    };
    /********** LISTENERS *************/
    /**
     * @param dropdown
     */
    SortingWidget.prototype.addListener = function (dropdown) {
        var _this = this;
        dropdown.addEventListener('change', function (event) {
            // get the selected value
            var target = event.target;
            var selectedValue = target.value; // Get the selected value from the dropdown
            var comparatorName = 'compareAlphabetically'; // Default comparator
            /**
             * I made an assumption that the items in the list have a vNode whose attribute names are
             * all the same across the vNodes. That is why I am using the first item in the list to get
             * the attributes.
             */
            for (var _i = 0, _a = _this.items; _i < _a.length; _i++) {
                var item = _a[_i];
                // Access the attribute value from the vNode using the selectedValue as the key
                var node = item.vNode.node;
                var attrValue = undefined;
                if (node.attributes) {
                    for (var _b = 0, _c = Object.keys(node.attributes); _b < _c.length; _b++) {
                        var key = _c[_b];
                        var nestedAttrs = node.attributes[key];
                        // Check if the selectedValue exists in the nested attributes
                        if (nestedAttrs && selectedValue in nestedAttrs) {
                            attrValue = nestedAttrs[selectedValue];
                            break;
                        }
                    }
                }
                if (attrValue !== undefined) {
                    item.value = NaN; // Reset the value to 0 before assigning a new value
                    console.log("Item ".concat(item.label, " in ").concat(selectedValue, " has value: ").concat(attrValue));
                    // Determine if attrValue can be casted to a number
                    if (!isNaN(Number(attrValue))) {
                        console.log('before =' + item.value);
                        item.value = Number(attrValue);
                        console.log('after =' + item.value);
                        // Use the numeric comparator if attrValue is a number
                        comparatorName = "compareValue";
                    }
                    else {
                        item.value = attrValue;
                        // Otherwise, use the alphabetical comparator
                        comparatorName = 'compareAlphabetically';
                    }
                }
            }
            console.log("Sorting items by: " + selectedValue + " using comparator: " + comparatorName);
            //sort the array and make a new chart
            (0, quicksort_1.quickSort)(_this.items, 0, _this.items.length - 1, comparatorName, "value"); // Sort the items based on the selected criteria
            _this.updateVisuals();
            console.log(_this.minValue + " " + _this.maxValue);
        });
    };
    return SortingWidget;
}());
exports.SortingWidget = SortingWidget;
