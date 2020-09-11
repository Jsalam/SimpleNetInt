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
        DOM.buttons.submitEdgeKinds.onclick = getEdgeKinds;

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

        //Dropdowns
        DOM.dropdowns.modelChoice = document.getElementById("modelChoice");
        DOM.dropdowns.modelChoice.addEventListener('change', () => {
            DOM.switchModel(DOM.dropdowns.modelChoice.value);
        });

    }

    /**Returns the value of a checkbox
     * @param {String} id checkbox id
     */
    static boxChecked(id) {
        for (const checkBox of Object.values(DOM.checkboxes)) {
            if (checkBox.id == id) {
                return checkBox.checked;
            }
        }
    }

    /** Invoked everytime a DOM element changes to refresh the renderer in draw() */
    static eventTriggered() {
        console.log("event on checkbox");
        DOM.event = true;
    }

    /** Invoked everytime a DOM element changes to refresh the renderer in draw() */
    static checkPropagation = function() {

        if (DOM.boxChecked("forward") || DOM.boxChecked("backward")) {
            ClusterFactory.checkPropagation();
        }

        DOM.event = true;
    }

    /**
     * Changes the background color
     * @param {Event} evt 
     */
    static switchBkgnd = function(evt) {
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
    static clearEdges = function() {
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
    static switchModel = function(value) {
        console.log("Switching to " + value + " network");
        Canvas.resetObservers();
        gp5.loadJSON(DOM.pathNetworks + value + '_network.json', DOM.onLoadNetwork);
    }

    /**
     * Callback for loadJSON
     * @param {Object} data 
     */
    static onLoadNetwork = function(data) {
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
    static buildClusters = function(result) {
        ClusterFactory.reset();
        ClusterFactory.makeClusters(result);
    }

    /**
     * Builds edges with data from JSON file
     * @param {*} result 
     */
    static buildEdges = function(result) {
        EdgeFactory.reset();
        EdgeFactory.buildEdges(result, ClusterFactory.clusters);
    }
}
DOM.event = false;
DOM.buttons = {};
DOM.checkboxes = {};
DOM.dropdowns = {};
DOM.labels = {};
DOM.sliders = {};