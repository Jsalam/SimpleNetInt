"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOM = void 0;
/**
 * This static class manages all the GUI elements displayed in the browser and serves as an interface between the DOM and the JavaScript code.
 */
var main_1 = require("../../main");
var importModalForm_1 = require("../forms/importModalForm");
var edgeFactory_1 = require("../../factories/edgeFactory");
var addClusterModalForm_1 = require("../forms/addClusterModalForm");
var canvas_1 = require("../../canvas/canvas");
var addNodeModalForm_1 = require("../forms/addNodeModalForm");
var exportModalForm_1 = require("../forms/exportModalForm");
var addEdgeCategoriesModalForm_1 = require("../forms/addEdgeCategoriesModalForm");
var clusterFactory_1 = require("../../factories/clusterFactory");
var ContextualGUI_1 = require("../ContextualGUIs/ContextualGUI");
var transformerFactory_1 = require("../../factories/transformerFactory");
var colorFactory_1 = require("../../factories/colorFactory");
var VirtualElementPool_1 = require("../../visualElements/VirtualElementPool");
var sortingListFactory_1 = require("../../factories/sortingListFactory");
var DOM = /** @class */ (function () {
    // This constructor is not needed, but it is here because the documentation generatior requires it to format the documentation
    function DOM() {
    }
    /** Initializes all the GUI elements created in the HTML
     */
    DOM.init = function () {
        // Add GUI Forms
        (0, importModalForm_1.importNetworkModalForm)();
        // Buttons
        DOM.buttons.clearEdges = document.getElementById("clearEdges");
        DOM.buttons.submitAddClusterModal = document.getElementById("SubmitAddClusterModal");
        DOM.buttons.submitAddNodeModal =
            document.getElementById("SubmitAddNodeModal");
        DOM.buttons.exportNetwork = document.getElementById("exportNetwork");
        DOM.buttons.importNetwork = document.getElementById("importNetwork");
        DOM.buttons.submitEdgeKinds = document.getElementById("submitEdgeKinds");
        DOM.buttons.toggle_instructions = document.getElementById("toggle_instructions");
        DOM.buttons.sortingWidgetsTitle = document.getElementById('sortingWidgetsTitle');
        DOM.buttons.clearEdges.onclick = function (evt) { return DOM.clearEdges(evt); };
        DOM.buttons.submitAddClusterModal.onclick = addClusterModalForm_1.getDataCluster;
        DOM.buttons.submitAddNodeModal.onclick = addNodeModalForm_1.getData;
        DOM.buttons.exportNetwork.onclick = exportModalForm_1.saveJSON;
        DOM.buttons.importNetwork.onclick = importModalForm_1.getDataImport;
        DOM.buttons.submitEdgeKinds.onclick = addEdgeCategoriesModalForm_1.getTextBoxContent;
        DOM.buttons.toggle_instructions.onclick = DOM.toggleInstructions;
        DOM.buttons.sortingWidgetsTitle.onclick = function () { DOM.toggleDisplay('addSortingWidget', 'flex'); DOM.toggleDisplay('sortingWidgets'); };
        // Checkboxes
        DOM.checkboxes.edit = document.getElementById("edit");
        DOM.checkboxes.forward = document.getElementById("forward");
        DOM.checkboxes.backward = document.getElementById("backward");
        DOM.checkboxes.backgroundContrast = document.getElementById("backgroundContrast");
        DOM.checkboxes.grid = document.getElementById("grid");
        DOM.checkboxes.showTexts = document.getElementById("showTexts");
        DOM.checkboxes.showEdges = document.getElementById("showEdges");
        DOM.checkboxes.showInEdges = document.getElementById("showInEdges");
        DOM.checkboxes.showOutEdges = document.getElementById("showOutEdges");
        DOM.checkboxes.magnifyingEffect = document.getElementById("magnifyingEffect");
        DOM.checkboxes.spacesMenu = document.getElementById("spaces");
        DOM.checkboxes.edit.onclick = function (evt) { return DOM.toggleContextualEdgeMenu(evt); };
        DOM.checkboxes.forward.onclick = function (evt) { return DOM.checkPropagation(evt); };
        DOM.checkboxes.backward.onclick = function (evt) { return DOM.checkPropagation(evt); };
        DOM.checkboxes.backgroundContrast.onclick = function (evt) { return DOM.switchBkgnd(evt); };
        DOM.checkboxes.grid.onclick = function (evt) { return DOM.switchGrid(evt); };
        DOM.checkboxes.showTexts.onclick = function (evt) { return DOM.eventTriggered(evt); };
        DOM.checkboxes.showEdges.onclick = function (evt) { return DOM.eventTriggered(evt); };
        DOM.checkboxes.showInEdges.onclick = function (evt) { return DOM.eventTriggered(evt); };
        DOM.checkboxes.showOutEdges.onclick = function (evt) { return DOM.eventTriggered(evt); };
        DOM.checkboxes.magnifyingEffect.onclick = function (evt) {
            return DOM.toggleMagnifyingEffect(evt);
        };
        DOM.checkboxes.spacesMenu.onclick = function (evt) {
            return DOM.toggleContextualSpacesMenu(evt);
        };
        // Sliders
        DOM.sliders.nodeConnectorFilter = document.getElementById("nodeConnectorFilter");
        DOM.sliders.nodeDegreeFilter = document.getElementById("nodeDegreeFilter");
        DOM.sliders.nodeSizeFactor = document.getElementById("nodeSizeFactor");
        DOM.sliders.edgeTickness = document.getElementById("edgeTickness");
        DOM.sliders.nodeConnectorFilter.oninput = function (evt) {
            return DOM.eventTriggered(evt);
        };
        DOM.sliders.nodeDegreeFilter.oninput = function (evt) {
            return DOM.eventTriggered(evt);
        };
        DOM.sliders.nodeSizeFactor.oninput = function (evt) {
            return DOM.eventTriggered(evt);
        };
        DOM.sliders.edgeTickness.oninput = function (evt) {
            return DOM.eventTriggered(evt);
        };
        // Dropdowns
        DOM.dropdowns.modelChoice = document.getElementById("modelChoice");
        DOM.dropdowns.modelChoice.addEventListener("change", function (evt) {
            DOM.switchModel(DOM.dropdowns.modelChoice.value, evt);
        });
        // TextBoxes
        DOM.textboxes.edgeKinds = document.getElementById("edgeKinds");
        // lists
        DOM.lists.filtersA = document.getElementById("filtersA");
        DOM.lists.filtersB = document.getElementById("filtersB");
        // Elements
        DOM.elements.screenMessage = document.getElementById("screenMessage");
        DOM.elements.currentFile = document.getElementById('currentFile');
        DOM.elements.sortingWidgets = document.getElementById('sortingWidgets');
        // Get the current status of checkboxes
        DOM.createNativeCurrentCheckboxes();
        DOM.updateCheckboxes();
        // update sliders
        DOM.updateSliders();
    };
    /**
     * Used to export edges from user interaction on the GUI
     * @param {Event} evt
     */
    DOM.exportEdges = function (evt) {
        // Export edges
        edgeFactory_1.EdgeFactory.recordJSON();
    };
    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     *
     */
    DOM.eventTriggered = function (evt) {
        DOM.updateCheckboxes(evt);
        DOM.updateSliders(evt);
        DOM.event = evt;
    };
    /**
     * Returns the value of a checkbox
     * @param {String} id checkbox id
     */
    DOM.boxChecked = function (id) {
        var box = DOM.currentCheckboxes.filter(function (elm) { return elm.key == id; })[0];
        return box.value;
    };
    /**
     * Displays a message on the screen
     * @param {*} message
     */
    DOM.showMessage = function (message) {
        DOM.elements.screenMessage.innerText = message;
        DOM.elements.screenMessage.style.left =
            (window.innerWidth - DOM.elements.screenMessage.offsetWidth) / 2 + "px";
        DOM.elements.screenMessage.style.display = "block";
    };
    /**
     * Hides the message displayed on the screen
     */
    DOM.hideMessage = function () {
        DOM.elements.screenMessage.innerText = "";
        DOM.elements.screenMessage.style.display = "none";
    };
    /**
     * The checkboxes originally designed in the HTML file.
     */
    DOM.createNativeCurrentCheckboxes = function () {
        for (var _i = 0, _a = Object.values(DOM.checkboxes); _i < _a.length; _i++) {
            var checkBox = _a[_i];
            var obj = { key: checkBox.id, value: checkBox.checked, native: true };
            DOM.currentCheckboxes.push(obj);
        }
    };
    DOM.updateCheckboxes = function (evt) {
        var _loop_1 = function (checkBox) {
            var exists = DOM.currentCheckboxes.filter(function (elm) { return elm.key == checkBox.id; })[0];
            if (exists) {
                exists.value = checkBox.checked;
            }
            else {
                var obj = { key: checkBox.id, value: checkBox.checked, native: false };
                DOM.currentCheckboxes.push(obj);
            }
        };
        for (var _i = 0, _a = Object.values(DOM.checkboxes); _i < _a.length; _i++) {
            var checkBox = _a[_i];
            _loop_1(checkBox);
        }
    };
    DOM.updateSliders = function (evt) {
        for (var _i = 0, _a = Object.keys(DOM.sliders); _i < _a.length; _i++) {
            var key = _a[_i];
            var element = DOM.sliders[key];
            if (element.labels[1])
                element.labels[1].innerText = element.value;
        }
    };
    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     */
    DOM.checkPropagation = function (evt) {
        DOM.updateCheckboxes(evt);
        if (DOM.boxChecked("forward") || DOM.boxChecked("backward")) {
            clusterFactory_1.ClusterFactory.checkPropagation();
        }
        DOM.event = evt;
    };
    /**
     * Changes the background color
     * @param {Event} evt
     */
    DOM.switchBkgnd = function (evt) {
        DOM.updateCheckboxes(evt);
        if (DOM.boxChecked("backgroundContrast")) {
            canvas_1.Canvas.currentBackground = 50;
        }
        else {
            canvas_1.Canvas.currentBackground = 250;
        }
        DOM.event = evt;
    };
    /**
     * Switch background visibility
     * @param {Event} evt
     */
    DOM.switchGrid = function (evt) {
        DOM.updateCheckboxes(evt);
        canvas_1.Canvas.showGrid = !canvas_1.Canvas.showGrid;
        DOM.event = evt;
    };
    /**
     * Delete edges and re-initialize nodes
     */
    DOM.clearEdges = function (evt) {
        edgeFactory_1.EdgeFactory.reset();
        canvas_1.Canvas.resetVEdges();
        canvas_1.Canvas.resetVConnectors();
        clusterFactory_1.ClusterFactory.resetAllConnectors();
        VirtualElementPool_1.VirtualElementPool.clear();
        DOM.event = evt;
    };
    /**
     * Loads the network file from the DOM.pathNetworks
     * @param {String} value prefix of the file. Usually a digit.
     */
    DOM.switchModel = function (value, evt) {
        // Discard the DOM elements in the pool
        VirtualElementPool_1.VirtualElementPool.clear();
        // reposition canvas to the origin
        canvas_1.Canvas.reset();
        console.log("Switching to " + value + " network");
        var selectElem = DOM.dropdowns.modelChoice;
        DOM.elements.currentFile.innerText = "Current Model: " + selectElem.options[Number(value)].innerHTML;
        main_1.gp5.loadJSON(DOM.pathNetworks + value + "_network.json", function (data) {
            DOM.onLoadNetwork(data, evt);
            DOM.createSortingWidget();
        });
    };
    /**
     * Callback for loadJSON
     * @param {Object} data { nodes: nodes data, edges: edges data }
     */
    DOM.onLoadNetwork = function (data, evt) {
        // Reset canvas, factories and GUI
        canvas_1.Canvas.resetObservers();
        clusterFactory_1.ClusterFactory.reset();
        edgeFactory_1.EdgeFactory.reset();
        // Reset TransFactory After reseting the clusters
        transformerFactory_1.TransFactory.reset();
        transformerFactory_1.TransFactory.init();
        // reset the list of edge kinds
        DOM.reset();
        // get nodes and edges
        var nodesTemp = data.nodes;
        var edgesTemp = data.edges;
        if (nodesTemp.length == 0) {
            clusterFactory_1.ClusterFactory.makeCluster({
                clusterID: "1",
                clusterType: "default",
                clusterLabel: "main space",
                clusterDescription: "The default space built on initialization",
            });
        }
        else {
            // build clusters and edges
            DOM.buildClusters(nodesTemp);
            DOM.buildEdges(edgesTemp);
        }
        // Get all the kinds of connectors added to the nodes from all clusters
        var connectorKinds = clusterFactory_1.ClusterFactory.getAllConnectorKinds();
        if (connectorKinds.length == 0)
            connectorKinds.push("default");
        // Add checkboxes to Filters list B in the DOM
        DOM.createCheckboxFor(connectorKinds, DOM.lists.filtersB);
        DOM.resetEdgeContextualMenuInputContent(connectorKinds);
        // Initialize the list of Edge Menu contextual GUI. Contextual menu created in ContextualGUI.init()
        ContextualGUI_1.ContextualGUI.init(connectorKinds);
        var _loop_2 = function (cluster) {
            var transformerTemp = transformerFactory_1.TransFactory.getTransformerByVClusterID(cluster.id);
            ContextualGUI_1.ContextualGUI.spacesMenu.addBoolean(cluster.label, false, function (val) {
                transformerTemp.setActive(val);
            });
        };
        // Add checkboxes to Space Menu contextual GUI. Contextual menu created in ContextualGUI.init()
        for (var _i = 0, _a = clusterFactory_1.ClusterFactory.clusters; _i < _a.length; _i++) {
            var cluster = _a[_i];
            _loop_2(cluster);
        }
        // Create color dictionary for connectors
        colorFactory_1.ColorFactory.makeDictionary(connectorKinds, colorFactory_1.ColorFactory.getPalette(1), "connectors");
        DOM.updateCheckboxes(evt);
        DOM.event = evt;
    };
    /**
     * Builds clusters with nodes data from JSON file
     * @param {Object} result
     */
    DOM.buildClusters = function (result) {
        clusterFactory_1.ClusterFactory.reset();
        clusterFactory_1.ClusterFactory.makeClusters(result);
    };
    /**
     * Builds edges with data from JSON file
     * @param {*} result
     */
    DOM.buildEdges = function (result) {
        edgeFactory_1.EdgeFactory.reset();
        edgeFactory_1.EdgeFactory.buildEdges(result, clusterFactory_1.ClusterFactory.clusters);
    };
    /**
     * Add a checkbox to a DOM element
     * @param {string} names  comma separated names
     * @param {object} list the element to which the checkbox will be appended
     */
    DOM.createCheckboxFor = function (names, list) {
        var items;
        if (names instanceof Array) {
            items = names;
        }
        else {
            items = names.split(",");
        }
        for (var index = 0; index < items.length; index++) {
            var name_1 = items[index];
            // div
            var div = document.createElement("div");
            div.classList.add("checkboxItem");
            // checkbox
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = name_1;
            checkbox.value = "value";
            checkbox.id = name_1;
            checkbox.onclick = DOM.eventTriggered; // event listener
            // label
            var label = document.createElement("label");
            label.classList.add("labelCheckbox");
            label.htmlFor = name_1;
            label.appendChild(document.createTextNode("\u00A0")); // &nbsp
            label.appendChild(document.createTextNode(name_1));
            div.appendChild(checkbox);
            div.appendChild(label);
            // prevent duplicate filters in menu
            if (!DOM.childrenExists(name_1, list)) {
                DOM.checkboxes[name_1] = checkbox;
                list.appendChild(div);
            }
        }
    };
    /**
     * Remove all the children from a DOM element
     * @param {object} parent the element to which the checkbox will be appended
     */
    DOM.removeChildrenOf = function (parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    };
    /**
     * Checks if a child with the given id exists in the list of children of a DOM element
     * @param {string} id the id of the new element
     * @param {object} list a DOM element
     */
    DOM.childrenExists = function (id, list) {
        for (var index = 0; index < list.children.length; index++) {
            // get the children in the list
            var child = list.children[index];
            // get the input un the case of checkboxes
            var childInput = child.children[0];
            if (childInput.id === id) {
                return true;
            }
        }
        return false;
    };
    DOM.toggleContextualEdgeMenu = function (evt) {
        ContextualGUI_1.ContextualGUI.edgeMenu.toggleVisibility();
        DOM.eventTriggered(evt);
    };
    /**
     *
     * @param evt changes the visibility of the contextual menu for spaces
     */
    DOM.toggleContextualSpacesMenu = function (evt) {
        ContextualGUI_1.ContextualGUI.spacesMenu.toggleVisibility();
        DOM.eventTriggered(evt);
    };
    DOM.toggleMagnifyingEffect = function (evt) {
        DOM.updateCheckboxes(evt);
        DOM.eventTriggered(evt);
    };
    DOM.toggleInstructions = function () {
        DOM.showLegend = !DOM.showLegend;
    };
    DOM.toggle_visibility = function (id) {
        var e = document.getElementById(id);
        if (window.getComputedStyle(e).opacity == "1") {
            e.style.opacity = "0.3";
        }
        else
            e.style.opacity = "1";
    };
    DOM.toggleDisplay = function (id, display) {
        if (display === void 0) { display = "block"; }
        var e = document.getElementById(id);
        if (e.style.display == "none" || e.style.display == "") {
            e.style.display = display;
        }
        else {
            e.style.display = "none";
        }
    };
    /**
     * Method used in the  DOM.switchModel() to create a dropdown menu of space names(cluster names)
     * after the network is loaded and adds an event listener to it.
     * The sorting list is not displayed by default (display:none) and is only displayed when the user opens the "Sorting lists" tab
     * */
    DOM.createSortingWidget = function (width, height) {
        if (width === void 0) { width = window.innerWidth - 200; }
        if (height === void 0) { height = 300; }
        // Create an array with the current cluster labels
        var clusterLabels = clusterFactory_1.ClusterFactory.clusters.map(function (cluster) { var _a; return (_a = cluster.label) !== null && _a !== void 0 ? _a : ""; });
        // Create a dropdown (select) element with the cluster labels
        var dropdown = DOM.createDropdown(clusterLabels, 'Add sorting list', 'sorting_dropdown', 'clusterLabelsDropdown');
        // Add an event listener to the dropdown
        dropdown.addEventListener("change", function (evt) {
            var target = evt.target;
            // get the selected value
            var selectedValue = target.value;
            // let parent = target.parentElement;
            // console.log("Selected cluster: " + selectedValue);
            // console.log(evt);
            // get a SortingWidget from the factory
            var widget = sortingListFactory_1.SortingListFactory.makeSortingWidget(selectedValue);
            if (widget !== undefined) {
                // append the sorting list to the sorting lists container above the dropwown
                DOM.elements.sortingWidgets.insertBefore(widget.makeChart(selectedValue + " >"), dropdown);
            }
            // Reset the dropdown to the first option
            dropdown.selectedIndex = 0;
        });
        // Append the dropdown to the sorting widget container
        DOM.elements.sortingWidgets.appendChild(dropdown);
    };
    DOM.resetEdgeContextualMenuInputContent = function (val) {
        DOM.textboxes.edgeKinds.value = val.toString();
    };
    /**
     * keep only the GUI native object in the currentCheckboxes array
     */
    DOM.resetCheckboxes = function () {
        DOM.currentCheckboxes = DOM.currentCheckboxes.filter(function (elm) { return elm.native == true; });
    };
    /**
     * Creates a dropdown (select) HTML element from an array of strings.
     * @param {string[]} options - The array of option strings.
     * @param {string} [id] - Optional id for the select element.
     * @returns {HTMLSelectElement} The dropdown menu element.
     */
    DOM.createDropdown = function (options, title, className, id) {
        if (title === void 0) { title = 'Drop'; }
        var select = document.createElement("select");
        if (className)
            select.className = className;
        if (id)
            select.id = id;
        // Add the title as a non-selectable option
        var titleOption = document.createElement("option");
        titleOption.text = title;
        titleOption.value = "";
        titleOption.disabled = true;
        titleOption.selected = true;
        select.appendChild(titleOption);
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var optionText = options_1[_i];
            var option = document.createElement("option");
            option.value = optionText;
            option.text = optionText;
            select.appendChild(option);
        }
        return select;
    };
    DOM.reset = function () {
        // keep only the GUI native object in the currentCheckboxes array
        DOM.resetCheckboxes();
        // clear the list of edge kinds from the DOM contextual menu
        DOM.resetEdgeContextualMenuInputContent("default");
        // remove all children from Filters dropdown in the GUI bar
        DOM.removeChildrenOf(DOM.lists.filtersB);
        // reset the sorting lists
        DOM.toggleDisplay('addSortingWidget', 'flex');
        DOM.toggleDisplay('sortingWidgets');
        var holder = DOM.elements.sortingWidgets;
        while (holder.children.length > 0) {
            holder.removeChild(holder.lastChild);
        }
    };
    DOM.pathNetworks = "";
    DOM.event = false;
    DOM.buttons = {};
    // the DOM input elements
    DOM.checkboxes = {};
    DOM.sliders = {};
    // the objects storing the current boolean condition
    DOM.currentCheckboxes = [];
    DOM.textboxes = {};
    DOM.dropdowns = {};
    DOM.labels = {};
    // the collection of lists of elements in the Filters dropdown in the GUI bar
    DOM.lists = {};
    DOM.showLegend = true;
    DOM.elements = {};
    return DOM;
}());
exports.DOM = DOM;
