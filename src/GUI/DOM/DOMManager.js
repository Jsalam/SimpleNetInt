/**
 * This static class manages all the GUI elements displayed in the browser and serves as an interface between the DOM and the JavaScript code.
 */

class DOM {
    // This constructor is not needed, but it is here because the documentation generatior requires it to format the documentation
    constructor() {}

    /** Initializes all the GUI elements created in the HTML
     */
    static init() {

        // Add GUI Forms
        importNetworkModalForm();

        // Buttons 
        DOM.buttons.clearEdges = document.getElementById("clearEdges");
        DOM.buttons.submitAddClusterModal = document.getElementById("SubmitAddClusterModal");
        DOM.buttons.submitAddNodeModal = document.getElementById("SubmitAddNodeModal");
        DOM.buttons.exportNetwork = document.getElementById("exportNetwork");
        DOM.buttons.importNetwork = document.getElementById("importNetwork");
        DOM.buttons.submitEdgeKinds = document.getElementById("submitEdgeKinds");
        DOM.buttons.toggle_instructions = document.getElementById("toggle_instructions");

        DOM.buttons.clearEdges.onclick = (evt) => DOM.clearEdges(evt);
        DOM.buttons.submitAddClusterModal.onclick = getDataCluster;
        DOM.buttons.submitAddNodeModal.onclick = getData;
        DOM.buttons.exportNetwork.onclick = saveJSON;
        DOM.buttons.importNetwork.onclick = getDataImport;
        DOM.buttons.submitEdgeKinds.onclick = DOM.getTextBoxContent;
        DOM.buttons.toggle_instructions.onclick = DOM.toggleInstructions;




        // Checkboxes
        DOM.checkboxes.edit = document.getElementById('edit');
        DOM.checkboxes.forward = document.getElementById('forward');
        DOM.checkboxes.backward = document.getElementById('backward');
        DOM.checkboxes.filterLinked = document.getElementById('filterLinked');
        DOM.checkboxes.backgroundContrast = document.getElementById('backgroundContrast');
        DOM.checkboxes.grid = document.getElementById('grid');
        DOM.checkboxes.showTexts = document.getElementById('showTexts');
        DOM.checkboxes.showEdges = document.getElementById('showEdges');
        DOM.checkboxes.magnifyingEffect = document.getElementById('magnifyingEffect');
        DOM.checkboxes.spacesMenu = document.getElementById('spaces');

        DOM.checkboxes.edit.onclick = (evt) => DOM.toggleContextualEdgeMenu(evt);
        DOM.checkboxes.forward.onclick = (evt) => DOM.checkPropagation(evt);
        DOM.checkboxes.backward.onclick = (evt) => DOM.checkPropagation(evt);
        DOM.checkboxes.filterLinked.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.backgroundContrast.onclick = (evt) => DOM.switchBkgnd(evt);
        DOM.checkboxes.grid.onclick = (evt) => DOM.switchGrid(evt);
        DOM.checkboxes.showTexts.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.showEdges.onclick = (evt) => DOM.eventTriggered(evt);
        DOM.checkboxes.magnifyingEffect.onclick = (evt) => DOM.toggleMagnifyingEffect(evt);
        DOM.checkboxes.spacesMenu.onclick = (evt) => DOM.toggleContextualSpacesMenu(evt);

        // Dropdowns
        DOM.dropdowns.modelChoice = document.getElementById("modelChoice");
        DOM.dropdowns.modelChoice.addEventListener('change', (evt) => {
            DOM.switchModel(DOM.dropdowns.modelChoice.value, evt);
        });

        // TextBoxes
        DOM.textboxes.edgeKinds = document.getElementById("edgeKinds");

        // lists
        DOM.lists.filtersA = document.getElementById('filtersA');
        DOM.lists.filtersB = document.getElementById('filtersB');

        // Get the current status of checkboxes 
        DOM.updateCheckboxes();
    }

    /**
     * Used to export edges from user interaction on the GUI
     * @param {Event} evt 
     */
    static exportEdges(evt) {

        // Export edges
        EdgeFactory.recordJSON();
    }

    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     * 
     */
    static eventTriggered(evt) {
        DOM.updateCheckboxes(evt);
        DOM.event = evt;
    }

    /**
     * Returns the value of a checkbox
     * @param {String} id checkbox id
     */
    static boxChecked(id) {
        let box = DOM.currentCheckboxes.filter(elm => elm.key == id)[0];
        return box.value;
    }

    static updateCheckboxes(evt) {
        for (const checkBox of Object.values(DOM.checkboxes)) {
            let exists = DOM.currentCheckboxes.filter(elm => elm.key == checkBox.id)[0]
            if (exists) {
                exists.value = checkBox.checked;
            } else {
                let obj = { key: checkBox.id, value: checkBox.checked }
                DOM.currentCheckboxes.push(obj);
            }
        }
    }

    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     */
    static checkPropagation(evt) {
        DOM.updateCheckboxes(evt);
        if (DOM.boxChecked("forward") || DOM.boxChecked("backward")) {
            ClusterFactory.checkPropagation();
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
            Canvas.currentBackground = 50;
        } else {
            Canvas.currentBackground = 250;
        }

        DOM.event = evt;
    }

    /**
     * Switch background visibility
     * @param {Event} evt 
     */
    static switchGrid(evt) {
        DOM.updateCheckboxes(evt);
        Canvas.showGrid = !Canvas.showGrid;
        DOM.event = evt;
    }

    /** 
     * Delete edges and re-initialize nodes
     */
    static clearEdges(evt) {
        EdgeFactory.reset();
        Canvas.resetVEdges();
        Canvas.resetVConnectors();
        ClusterFactory.resetAllConnectors();
        DOM.event = evt;
    }

    /**
     * Loads the network file from the DOM.pathNetworks 
     * @param {String} value prefix of the file. Usually a digit. 
     */
    static switchModel(value, evt) {
        Canvas.clear();

        console.log("Switching to " + value + " network");

        gp5.loadJSON(DOM.pathNetworks + value + '_network.json', (data) => {

            DOM.onLoadNetwork(data, evt);
        });

    }

    /**
     * Callback for loadJSON
     * @param {Object} data 
     */
    static onLoadNetwork(data, evt) {

        // Reset canvas, factories and GUI
        Canvas.resetObservers();
        ClusterFactory.reset();
        EdgeFactory.reset();

        // Reset TransFactory After reseting the clusters
        TransFactory.reset();
        TransFactory.init();

        // reset the list of edge kinds
        DOM.textboxes.edgeKinds.textContent = "default";
        DOM.removeChildrenOf(DOM.lists.filtersB);

        // get nodes and edges 
        let nodesTemp = data.nodes;
        let edgesTemp = data.edges;

        if (nodesTemp.length == 0) {
            ClusterFactory.makeCluster({
                clusterID: 1,
                clusterLabel: "main space",
                clusterDescription: "The default space built on initialization"
            })
        } else {
            // build clusters and edges
            DOM.buildClusters(nodesTemp);
            DOM.buildEdges(edgesTemp);
        }

        // add checkboxes to filters. It takes whatever is in the textbox of the "Edge Categories" button and adds it to the filter list
        DOM.createCheckboxFor(DOM.textboxes.edgeKinds.value, DOM.lists.filtersB)

        // initialize contextual menues
        ContextualGUI.init(DOM.textboxes.edgeKinds.value);

        // add checkboxes to space contextual menu. Contextual menu created in ContextualGUI.init()
        for (const cluster of ClusterFactory.clusters) {
            let transformerTemp = TransFactory.getTransformerByVClusterID(cluster.id);
            ContextualGUI.spacesMenu.addBoolean(cluster.label, false, (val) => { transformerTemp.setActive(val) });
        }

        DOM.updateCheckboxes(evt);
        DOM.event = evt;
    }

    /**
     * Builds clusters with nodes data from JSON file
     * @param {Object} result 
     */
    static buildClusters(result) {
        ClusterFactory.reset();
        ClusterFactory.makeClusters(result);
    }

    /**
     * Builds edges with data from JSON file
     * @param {*} result 
     */
    static buildEdges(result) {
        EdgeFactory.reset();
        EdgeFactory.buildEdges(result, ClusterFactory.clusters);
    }

    static getTextBoxContent() {

        // Initialize the gui with the text from the textbox on the DOM
        ContextualGUI.init(DOM.textboxes.edgeKinds.value);

        // add checkboxes to filters list B
        DOM.createCheckboxFor(DOM.textboxes.edgeKinds.value, DOM.lists.filtersB)
    }

    /**
     * Add a checkbox to a DOM element
     * @param {string} names  comma separated names
     * @param {object} list the element to which the checkbox will be appended
     */
    static createCheckboxFor(names, list) {

        let items = names.split(',');

        for (let index = 0; index < items.length; index++) {
            const name = items[index];

            // div
            let div = document.createElement('div');
            div.classList.add("checkboxItem");

            // checkbox
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = name;
            checkbox.value = "value";
            checkbox.id = name;
            checkbox.onclick = DOM.eventTriggered; // event listener

            // label
            var label = document.createElement('label')
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
     * Adds a children with a given id into a DOM element
     * @param {string} id the id of the new element
     * @param {object} list a DOM element 
     */
    static childrenExists(id, list) {
        for (let index = 0; index < list.children.length; index++) {
            // get the children in the list
            const child = list.children[index];
            // get the input un the case of checkboxes
            const childInput = child.children[0]
            if (childInput.id === id) {
                return true;
            }
        }
        return false;
    }

    static toggleContextualEdgeMenu(evt) {
        ContextualGUI.edgeMenu.toggleVisibility();
        DOM.eventTriggered(evt)
    }

    static toggleContextualSpacesMenu(evt) {
        ContextualGUI.spacesMenu.toggleVisibility();
        DOM.eventTriggered(evt)
    }

    static toggleMagnifyingEffect(evt) {
        DOM.updateCheckboxes(evt);
        DOM.eventTriggered(evt)
    }


    static toggleInstructions() {
        DOM.showLegend = !DOM.showLegend;
    }
}
DOM.event = false;
DOM.buttons = {};
DOM.checkboxes = {};
DOM.currentCheckboxes = [];
DOM.textboxes = {};
DOM.dropdowns = {};
DOM.labels = {};
DOM.sliders = {};
DOM.lists = {};
DOM.showLegend = true;