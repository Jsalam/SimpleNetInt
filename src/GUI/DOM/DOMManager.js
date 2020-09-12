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

        DOM.buttons.clearEdges.onclick = DOM.clearEdges;
        DOM.buttons.submitAddClusterModal.onclick = getDataCluster;
        DOM.buttons.submitAddNodeModal.onclick = getData;
        DOM.buttons.exportNetwork.onclick = saveJSON;
        DOM.buttons.importNetwork.onclick = getDataImport;
        DOM.buttons.submitEdgeKinds.onclick = DOM.getTextBoxContent;
        // Checkboxes
        DOM.checkboxes.edit = document.getElementById('edit');
        DOM.checkboxes.forward = document.getElementById('forward');
        DOM.checkboxes.backward = document.getElementById('backward');
        DOM.checkboxes.filterLinked = document.getElementById('filterLinked');
        DOM.checkboxes.backgroundContrast = document.getElementById('backgroundContrast');

        DOM.checkboxes.edit.onclick = DOM.eventTriggered;
        DOM.checkboxes.forward.onclick = DOM.checkPropagation;
        DOM.checkboxes.backward.onclick = DOM.checkPropagation;
        DOM.checkboxes.filterLinked.onclick = DOM.eventTriggered;
        DOM.checkboxes.backgroundContrast.onclick = DOM.switchBkgnd;

        // Dropdowns
        DOM.dropdowns.modelChoice = document.getElementById("modelChoice");
        DOM.dropdowns.modelChoice.addEventListener('change', () => {
            DOM.switchModel(DOM.dropdowns.modelChoice.value);
        });

        // TextBoxes
        DOM.textboxes.edgeKinds = document.getElementById("edgeKinds");

        // lists
        DOM.lists.filters = document.getElementById('filters');

        // Get the current status of checkboxes 
        DOM.updateCheckboxes();
    }

    /**
     * Invoked everytime a DOM element changes to refresh the renderer in draw()
     * 
     */
    static eventTriggered(evt) {
        DOM.updateCheckboxes();
        DOM.event = true;
    }

    /**
     * Returns the value of a checkbox
     * @param {String} id checkbox id
     */
    static boxChecked(id) {
        let box = DOM.currentCheckboxes.filter(elm => elm.key == id)[0];
        return box.value;
    }

    static updateCheckboxes() {
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
    static checkPropagation() {
        DOM.updateCheckboxes();
        if (DOM.boxChecked("forward") || DOM.boxChecked("backward")) {
            ClusterFactory.checkPropagation();
        }
        DOM.event = true;
    }

    /**
     * Changes the background color
     * @param {Event} evt 
     */
    static switchBkgnd(evt) {
        DOM.updateCheckboxes();
        if (DOM.boxChecked("backgroundContrast")) {
            Canvas.currentBackground = 150;
        } else {
            Canvas.currentBackground = 230;
        }

        DOM.event = true;
    }

    /** 
     * Delete edges and re-initialize nodes
     */
    static clearEdges() {
        EdgeFactory.reset();
        Canvas.resetVEdges();
        Canvas.resetVConnectors();
        ClusterFactory.resetAllConnectors();

        DOM.event = true;
    }

    /**
     * Loads the network file from the DOM.pathNetworks 
     * @param {String} value prefix of the file. Usually a digit. 
     */
    static switchModel(value) {
        console.log("Switching to " + value + " network");
        Canvas.resetObservers();
        gp5.loadJSON(DOM.pathNetworks + value + '_network.json', DOM.onLoadNetwork);
    }

    /**
     * Callback for loadJSON
     * @param {Object} data 
     */
    static onLoadNetwork(data) {
        let nodesTemp = data.nodes;
        DOM.buildClusters(nodesTemp);
        let edgesTemp = data.edges;
        DOM.buildEdges(edgesTemp);
        Canvas.update();
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
        // add checkboxes to filters
        DOM.createCheckboxFor(DOM.textboxes.edgeKinds.value, DOM.lists.filters)
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

            // checkbox
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = name;
            checkbox.value = "value";
            checkbox.id = name;
            checkbox.onclick = DOM.eventTriggered; // event listener

            // label
            var label = document.createElement('label')
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
                console.log(id);
                return true;
            }
        }
        return false;
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