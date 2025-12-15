"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOM = void 0;
/**
 * This static class manages all the GUI elements displayed in the browser and serves as an interface between the DOM and the JavaScript code.
 */
const main_1 = require("../../main");
const importModalForm_1 = require("../forms/importModalForm");
const edgeFactory_1 = require("../../factories/edgeFactory");
const addClusterModalForm_1 = require("../forms/addClusterModalForm");
const canvas_1 = require("../../canvas/canvas");
const addNodeModalForm_1 = require("../forms/addNodeModalForm");
const exportModalForm_1 = require("../forms/exportModalForm");
const addEdgeCategoriesModalForm_1 = require("../forms/addEdgeCategoriesModalForm");
const clusterFactory_1 = require("../../factories/clusterFactory");
const ContextualGUI_1 = require("../ContextualGUIs/ContextualGUI");
const transformerFactory_1 = require("../../factories/transformerFactory");
const colorFactory_1 = require("../../factories/colorFactory");
const VirtualElementPool_1 = require("../../visualElements/VirtualElementPool");
const sortingListFactory_1 = require("../../factories/sortingListFactory");
const settingsPanelFactory_1 = require("../../factories/settingsPanelFactory");
class DOM {
    static pathNetworks = "";
    static event = false;
    static buttons = {};
    // the DOM input elements
    static checkboxes = {};
    static sliders = {};
    // the objects storing the current boolean condition
    static currentCheckboxes = [];
    static textboxes = {};
    static dropdowns = {};
    static labels = {};
    // the collection of lists of elements in the Filters dropdown in the GUI bar
    static lists = {};
    static showLegend = true;
    static elements = {};
    // This constructor is not needed, but it is here because the documentation generatior requires it to format the documentation
    constructor() { }
    /** Initializes all the GUI elements created in the HTML
     */
    static init() {
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
        DOM.buttons.clearEdges.onclick = (evt) => DOM.clearEdges(evt);
        DOM.buttons.submitAddClusterModal.onclick = addClusterModalForm_1.getDataCluster;
        DOM.buttons.submitAddNodeModal.onclick = addNodeModalForm_1.getData;
        DOM.buttons.exportNetwork.onclick = exportModalForm_1.saveJSON;
        DOM.buttons.importNetwork.onclick = importModalForm_1.getDataImport;
        DOM.buttons.submitEdgeKinds.onclick = addEdgeCategoriesModalForm_1.getTextBoxContent;
        DOM.buttons.toggle_instructions.onclick = DOM.toggleInstructions;
        DOM.buttons.sortingWidgetsTitle.onclick = () => { DOM.toggleDisplay('addSortingWidget', 'flex'); DOM.toggleDisplay('sortingWidgets'); };
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
        // DOM.checkboxes.spacesMenu = document.getElementById(
        //   "spaces",
        // ) as HTMLInputElement;
        DOM.checkboxes.edit.onclick = (evt) => DOM.toggleContextualEdgeMenu(evt);
        DOM.checkboxes.forward.onclick = (evt) => DOM.checkPropagation(evt);
        DOM.checkboxes.backward.onclick = (evt) => DOM.checkPropagation(evt);
        DOM.checkboxes.backgroundContrast.onclick = (evt) => DOM.switchBkgnd(evt);
        DOM.checkboxes.grid.onclick = (evt) => DOM.switchGrid(evt);
        DOM.checkboxes.showTexts.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.showEdges.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.showInEdges.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.showOutEdges.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.magnifyingEffect.onclick = (evt) => DOM.toggleMagnifyingEffect(evt);
        // DOM.checkboxes.spacesMenu.onclick = (evt) =>
        //   DOM.toggleContextualSpacesMenu(evt);
        // Sliders
        DOM.sliders.nodeConnectorFilter = document.getElementById("nodeConnectorFilter");
        DOM.sliders.nodeDegreeFilter = document.getElementById("nodeDegreeFilter");
        DOM.sliders.nodeSizeFactor = document.getElementById("nodeSizeFactor");
        DOM.sliders.edgeTickness = document.getElementById("edgeTickness");
        DOM.sliders.nodeConnectorFilter.oninput = (evt) => DOM.eventTriggered(evt);
        DOM.sliders.nodeDegreeFilter.oninput = (evt) => DOM.eventTriggered(evt);
        DOM.sliders.nodeSizeFactor.oninput = (evt) => DOM.eventTriggered(evt);
        DOM.sliders.edgeTickness.oninput = (evt) => DOM.eventTriggered(evt);
        // Dropdowns
        DOM.dropdowns.modelChoice = document.getElementById("modelChoice");
        DOM.dropdowns.modelChoice.addEventListener("change", (evt) => {
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
    }
    /**
     * Used to export edges from user interaction on the GUI
     * @param {Event} evt
     */
    static exportEdges(evt) {
        // Export edges
        edgeFactory_1.EdgeFactory.recordJSON();
    }
    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     *
     */
    static eventTriggered(evt) {
        DOM.updateCheckboxes(evt);
        DOM.updateSliders(evt);
        DOM.event = evt;
    }
    /**
     * Returns the value of a checkbox
     * @param {String} id checkbox id
     */
    static boxChecked(id) {
        let box = DOM.currentCheckboxes.filter((elm) => elm.key == id)[0];
        return box.value;
    }
    /**
     * Displays a message on the screen
     * @param {*} message
     */
    static showMessage(message) {
        DOM.elements.screenMessage.innerText = message;
        DOM.elements.screenMessage.style.left =
            (window.innerWidth - DOM.elements.screenMessage.offsetWidth) / 2 + "px";
        DOM.elements.screenMessage.style.display = "block";
    }
    /**
     * Hides the message displayed on the screen
     */
    static hideMessage() {
        DOM.elements.screenMessage.innerText = "";
        DOM.elements.screenMessage.style.display = "none";
    }
    /**
     * The checkboxes originally designed in the HTML file.
     */
    static createNativeCurrentCheckboxes() {
        for (const checkBox of Object.values(DOM.checkboxes)) {
            let obj = { key: checkBox.id, value: checkBox.checked, native: true };
            DOM.currentCheckboxes.push(obj);
        }
    }
    static updateCheckboxes(evt) {
        for (const checkBox of Object.values(DOM.checkboxes)) {
            let exists = DOM.currentCheckboxes.filter((elm) => elm.key == checkBox.id)[0];
            if (exists) {
                exists.value = checkBox.checked;
            }
            else {
                let obj = { key: checkBox.id, value: checkBox.checked, native: false };
                DOM.currentCheckboxes.push(obj);
            }
        }
    }
    static updateSliders(evt) {
        for (const key of Object.keys(DOM.sliders)) {
            let element = DOM.sliders[key];
            if (element.labels[1])
                element.labels[1].innerText = element.value;
        }
    }
    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     */
    static checkPropagation(evt) {
        DOM.updateCheckboxes(evt);
        if (DOM.boxChecked("forward") || DOM.boxChecked("backward")) {
            clusterFactory_1.ClusterFactory.checkPropagation();
        }
        DOM.event = evt;
    }
    /**
     * Changes the background color
     * @param {Event} evt
     */
    static switchBkgnd(evt) {
        DOM.updateCheckboxes(evt);
        if (DOM.boxChecked("backgroundContrast")) {
            canvas_1.Canvas.currentBackground = 50;
        }
        else {
            canvas_1.Canvas.currentBackground = 250;
        }
        DOM.event = evt;
    }
    /**
     * Switch background visibility
     * @param {Event} evt
     */
    static switchGrid(evt) {
        DOM.updateCheckboxes(evt);
        canvas_1.Canvas.showGrid = !canvas_1.Canvas.showGrid;
        DOM.event = evt;
    }
    /**
     * Delete edges and re-initialize nodes
     */
    static clearEdges(evt) {
        edgeFactory_1.EdgeFactory.reset();
        canvas_1.Canvas.resetVEdges();
        canvas_1.Canvas.resetVConnectors();
        clusterFactory_1.ClusterFactory.resetAllConnectors();
        VirtualElementPool_1.VirtualElementPool.clear();
        DOM.event = evt;
    }
    /**
     * Loads the network file from the DOM.pathNetworks
     * @param {String} value prefix of the file. Usually a digit.
     */
    static switchModel(value, evt) {
        // Discard the DOM elements in the pool
        VirtualElementPool_1.VirtualElementPool.clear();
        // reposition canvas to the origin
        canvas_1.Canvas.reset();
        console.log("Switching to " + value + " network");
        const selectElem = DOM.dropdowns.modelChoice;
        DOM.elements.currentFile.innerText = "Current Model: " + selectElem.options[Number(value)].innerHTML;
        main_1.gp5.loadJSON(DOM.pathNetworks + value + "_network.json", (data) => {
            DOM.onLoadNetwork(data, evt);
            DOM.createSortingWidget();
        });
    }
    /**
     * Callback for loadJSON
     * @param {Object} data { nodes: nodes data, edges: edges data }
     */
    static onLoadNetwork(data, evt) {
        // Reset canvas, factories and GUI
        canvas_1.Canvas.resetObservers();
        clusterFactory_1.ClusterFactory.reset();
        settingsPanelFactory_1.SettingsPanelFactory.reset();
        edgeFactory_1.EdgeFactory.reset();
        // Reset TransFactory After reseting the clusters
        transformerFactory_1.TransFactory.reset();
        transformerFactory_1.TransFactory.init();
        // reset the list of edge kinds
        DOM.reset();
        // get nodes and edges
        let nodesTemp = data.nodes;
        let edgesTemp = data.edges;
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
        const connectorKinds = clusterFactory_1.ClusterFactory.getAllConnectorKinds();
        if (connectorKinds.length == 0)
            connectorKinds.push("default");
        // Add checkboxes to Filters list B in the DOM
        DOM.createCheckboxFor(connectorKinds, DOM.lists.filtersB);
        DOM.resetEdgeContextualMenuInputContent(connectorKinds);
        // Initialize the list of Edge Menu contextual GUI. Contextual menu created in ContextualGUI.init()
        ContextualGUI_1.ContextualGUI.init(connectorKinds);
        // Add checkboxes to Space Menu contextual GUI. Contextual menu created in ContextualGUI.init()
        // if (ContextualGUI.spacesMenu) {
        // for (const cluster of ClusterFactory.clusters) {
        //   let transformerTemp = TransFactory.getTransformerByVClusterID(cluster.id);
        //   ContextualGUI.spacesMenu.addBoolean(cluster.label!, false, (val:boolean) => {
        //     transformerTemp.setActive(val);
        //   });
        // }}
        // Create color dictionary for connectors
        colorFactory_1.ColorFactory.makeDictionary(connectorKinds, colorFactory_1.ColorFactory.getPalette(1), "connectors");
        DOM.updateCheckboxes(evt);
        DOM.event = evt;
    }
    /**
     * Builds clusters with nodes data from JSON file
     * @param {Object} result
     */
    static buildClusters(result) {
        clusterFactory_1.ClusterFactory.reset();
        clusterFactory_1.ClusterFactory.makeClusters(result);
    }
    /**
     * Builds edges with data from JSON file
     * @param {*} result
     */
    static buildEdges(result) {
        edgeFactory_1.EdgeFactory.reset();
        edgeFactory_1.EdgeFactory.buildEdges(result, clusterFactory_1.ClusterFactory.clusters);
    }
    /**
     * Add a checkbox to a DOM element
     * @param {string} names  comma separated names
     * @param {object} list the element to which the checkbox will be appended
     */
    static createCheckboxFor(names, list) {
        let items;
        if (names instanceof Array) {
            items = names;
        }
        else {
            items = names.split(",");
        }
        for (let index = 0; index < items.length; index++) {
            const name = items[index];
            // div
            let div = document.createElement("div");
            div.classList.add("checkboxItem");
            // checkbox
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = name;
            checkbox.value = "value";
            checkbox.id = name;
            checkbox.onclick = DOM.eventTriggered; // event listener
            // label
            var label = document.createElement("label");
            label.classList.add("labelCheckbox");
            label.htmlFor = name;
            label.appendChild(document.createTextNode("\u00A0")); // &nbsp
            label.appendChild(document.createTextNode(name));
            div.appendChild(checkbox);
            div.appendChild(label);
            // prevent duplicate filters in menu
            if (!DOM.childrenExists(name, list)) {
                DOM.checkboxes[name] = checkbox;
                list.appendChild(div);
            }
        }
    }
    /**
     * Remove all the children from a DOM element
     * @param {object} parent the element to which the checkbox will be appended
     */
    static removeChildrenOf(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }
    /**
     * Checks if a child with the given id exists in the list of children of a DOM element
     * @param {string} id the id of the new element
     * @param {object} list a DOM element
     */
    static childrenExists(id, list) {
        for (let index = 0; index < list.children.length; index++) {
            // get the children in the list
            const child = list.children[index];
            // get the input un the case of checkboxes
            const childInput = child.children[0];
            if (childInput.id === id) {
                return true;
            }
        }
        return false;
    }
    static toggleContextualEdgeMenu(evt) {
        ContextualGUI_1.ContextualGUI.edgeMenu.toggleVisibility();
        DOM.eventTriggered(evt);
    }
    /**
     *
     * @param evt changes the visibility of the contextual menu for spaces
     */
    // static toggleContextualSpacesMenu(evt: UIEvent) {
    //   ContextualGUI.spacesMenu.toggleVisibility();
    //   DOM.eventTriggered(evt);
    // }
    static toggleMagnifyingEffect(evt) {
        DOM.updateCheckboxes(evt);
        DOM.eventTriggered(evt);
    }
    static toggleInstructions() {
        DOM.showLegend = !DOM.showLegend;
    }
    static toggle_visibility(id) {
        let e = document.getElementById(id);
        if (window.getComputedStyle(e).opacity == "1") {
            e.style.opacity = "0.3";
        }
        else
            e.style.opacity = "1";
    }
    static toggleDisplay(id, display = "block") {
        let e = document.getElementById(id);
        if (e.style.display == "none" || e.style.display == "") {
            e.style.display = display;
        }
        else {
            e.style.display = "none";
        }
    }
    /**
     * Method used in the  DOM.switchModel() to create a dropdown menu of space names(cluster names)
     * after the network is loaded and adds an event listener to it.
     * The sorting list is not displayed by default (display:none) and is only displayed when the user opens the "Sorting lists" tab
     * */
    static createSortingWidget(width = window.innerWidth - 200, height = 300) {
        // Create an array with the current cluster labels
        const clusterLabels = clusterFactory_1.ClusterFactory.clusters.map(cluster => cluster.label ?? "");
        // Create a dropdown (select) element with the cluster labels
        let dropdown = DOM.createDropdown(clusterLabels, 'Add sorting list', 'sorting_dropdown', 'clusterLabelsDropdown');
        // Add an event listener to the dropdown
        dropdown.addEventListener("change", (evt) => {
            let target = evt.target;
            // get the selected value
            let selectedValue = target.value;
            // get a SortingWidget from the factory
            let widget = sortingListFactory_1.SortingListFactory.makeSortingWidget(selectedValue);
            if (widget !== undefined) {
                // append the sorting list to the sorting lists container above the dropwown
                DOM.elements.sortingWidgets.insertBefore(widget.makeChart(selectedValue), dropdown);
            }
            // Reset the dropdown to the first option
            dropdown.selectedIndex = 0;
        });
        // Append the dropdown to the sorting widget container
        DOM.elements.sortingWidgets.appendChild(dropdown);
    }
    static resetEdgeContextualMenuInputContent(val) {
        DOM.textboxes.edgeKinds.value = val.toString();
    }
    /**
     * keep only the GUI native object in the currentCheckboxes array
     */
    static resetCheckboxes() {
        DOM.currentCheckboxes = DOM.currentCheckboxes.filter((elm) => elm.native == true);
    }
    /**
     * Creates a dropdown (select) HTML element from an array of strings.
     * @param {string[]} options - The array of option strings.
     * @param {string} [id] - Optional id for the select element.
     * @returns {HTMLSelectElement} The dropdown menu element.
     */
    static createDropdown(options, title = 'Drop', className, id) {
        const select = document.createElement("select");
        if (className)
            select.className = className;
        if (id)
            select.id = id;
        // Add the title as a non-selectable option
        const titleOption = document.createElement("option");
        titleOption.text = title;
        titleOption.value = "";
        titleOption.disabled = true;
        titleOption.selected = true;
        select.appendChild(titleOption);
        for (const optionText of options) {
            const option = document.createElement("option");
            option.value = optionText;
            option.text = optionText;
            select.appendChild(option);
        }
        return select;
    }
    static reset() {
        // keep only the GUI native object in the currentCheckboxes array
        DOM.resetCheckboxes();
        // clear the list of edge kinds from the DOM contextual menu
        DOM.resetEdgeContextualMenuInputContent("default");
        // remove all children from Filters dropdown in the GUI bar
        DOM.removeChildrenOf(DOM.lists.filtersB);
        // reset the sorting lists
        DOM.toggleDisplay('addSortingWidget', 'flex');
        DOM.toggleDisplay('sortingWidgets');
        const holder = DOM.elements.sortingWidgets;
        while (holder.children.length > 0) {
            holder.removeChild(holder.lastChild);
        }
    }
}
exports.DOM = DOM;
//# sourceMappingURL=DOMManager.js.map