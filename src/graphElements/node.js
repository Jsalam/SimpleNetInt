"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var connector_1 = require("./connector");
var edgeFactory_1 = require("../factories/edgeFactory");
var edge_1 = require("./edge");
var ContextualGUI_1 = require("../GUI/ContextualGUIs/ContextualGUI");
var DOMManager_1 = require("../GUI/DOM/DOMManager");
/**
 * The node has connectors. each connector is of a different type, so each kind of connectors have its own collection,
 * grouped in a single collection
 * @param clusterID: the cluster to which this node belongs to
 * @param _indexInCluster: the index in this cluster
 * @param _count: the pajekIndex
 */
var Node = /** @class */ (function () {
    function Node(clusterID, _indexInCluster, _count) {
        this.idCat = {
            cluster: clusterID,
            index: _indexInCluster,
            pajekIndex: _count,
        };
        this.connectors = [];
        this.label = "void";
        this.description = "No description yet";
        this.attributes;
        this.inFwdPropagation = false;
        this.inBkwPropagation = false;
        this.vNodeObserver;
        this.importedVNodeData;
        // get the degrees using the getDegree, getInDegree and getOutDegree functions
    }
    /**** OBSERVER ****/
    Node.prototype.subscribe = function (vNode) {
        this.vNodeObserver = vNode;
    };
    /**
     * Returns true if the ID is equal to another node
     * @param {Node} node
     * @returns
     */
    Node.prototype.equals = function (node) {
        var rtn = false;
        if (this.idCat.cluster == node.idCat.cluster &&
            this.idCat.index == node.idCat.index &&
            this.idCat.pajekIndex == node.idCat.pajekIndex) {
            rtn = true;
        }
        return rtn;
    };
    /**** FILTERS *****/
    /**
     * This method matches the user selections on the gui with the connectors of this node.
     * If any, the corresponding VConnector AND VNODE are marked as selected.
     * This method should be handled by the VNode subcribed to this node
     */
    Node.prototype.filterConnectors = function () {
        // on a DOM Event (similar to contextualGUI)/ this should be handled by the VNode subcribed to this node
        var filteredConnectors = this.connectors.filter(function (cnctr) {
            var rtn = false;
            // mark vConnector as unselected
            cnctr.vConnectorObserver.selected = false;
            // iterate over the gui checkboxes
            for (var _i = 0, _a = DOMManager_1.DOM.currentCheckboxes; _i < _a.length; _i++) {
                var ckbx = _a[_i];
                // check which checkboxes are checked and get the keys
                // if any of the keys match the connectors of this node
                if (ckbx.value == true && cnctr.kind == ckbx.key) {
                    rtn = true;
                    // mark this Vconnector observer as selected
                    cnctr.vConnectorObserver.selected = true;
                }
            }
            return rtn;
        });
        // Switch the vNode selected to true
        if (filteredConnectors.length > 0) {
            this.vNodeObserver.selected = true;
        }
        else {
            this.vNodeObserver.selected = false;
        }
        return filteredConnectors;
    };
    /**** CONNECTORS ****/
    /** Adds a connector to the collection of this node
     * @param {String} kind kind of connector
     * @param {Number} index index for connector ID
     */
    Node.prototype.addConnector = function (kind, index) {
        var tmpConnector = new connector_1.Connector(this.idCat, kind, index);
        this.connectors.push(tmpConnector);
        return tmpConnector;
    };
    /** Finds an edge and removes it from the collection of connectors observers
     * @param {Edge} edge the edge to be removed
     */
    Node.prototype.disconnectEdge = function (edge) {
        // for each connector
        for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
            var conn = _a[_i];
            // go over the edgeObservers collection
            for (var i = 0; i < conn.edgeObservers.length; i++) {
                var obs = conn.edgeObservers[i];
                // if one of the edges is equal to the edge of this vEdge
                if (obs.equals(edge)) {
                    // remove that element from the collection
                    conn.edgeObservers.splice(i, 1);
                }
            }
        }
    };
    /** Removes a connector matching the given connector from the connectors observers
     * @param {Connector} conn the connector to be removed
     */
    Node.prototype.removeConnector = function (conn) {
        this.connectors = this.connectors.filter(function (cnctr) {
            var rtn = true;
            if (cnctr.equals(conn)) {
                if (cnctr.edgeObservers.length <= 1) {
                    rtn = false;
                }
            }
            // removes connector if false
            return rtn;
        });
    };
    /** gets all the connectors
     *
     */
    Node.prototype.getConnectors = function () {
        return this.connectors;
    };
    /** resets this connectros and observer vNode vConnectors
     *
     */
    Node.prototype.resetConnectors = function () {
        this.connectors = [];
        this.vNodeObserver.resetVConnectors();
    };
    /**** ATTRIBUTES ****/
    Node.prototype.setLabel = function (label) {
        this.label = label;
    };
    Node.prototype.setDescription = function (description) {
        this.description = description;
    };
    Node.prototype.setAttributes = function (attributes) {
        this.attributes = attributes;
    };
    Node.prototype.setImportedVNodeData = function (obj) {
        this.importedVNodeData = obj;
    };
    Node.prototype.getDegree = function () {
        var degree = 0;
        for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
            var connector = _a[_i];
            degree += connector.edgeObservers.length;
        }
        return degree;
    };
    Node.prototype.getInDegree = function () {
        var inDegree = 0;
        for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
            var connector = _a[_i];
            if (connector.edgeObservers[0].target.equals(this))
                inDegree += connector.edgeObservers.length;
        }
        return inDegree;
    };
    Node.prototype.getOutDegree = function () {
        var outDegree = 0;
        for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
            var connector = _a[_i];
            if (connector.edgeObservers[0].source.equals(this))
                outDegree += connector.edgeObservers.length;
        }
        return outDegree;
    };
    /**** PROPAGATION ****/
    Node.prototype.propagate = function (node, clicked) {
        console.log("__ From __ " + this.label);
        this.propagateForward2(node, clicked);
        this.propagateBackward2(node, clicked);
    };
    Node.prototype.updatePropagation2 = function () {
        if (this.inFwdPropagation && DOMManager_1.DOM.boxChecked("forward")) {
            console.log("______ Updated From __ " + this.label);
            this.propagateForward2(this, true);
        }
        if (this.inBkwPropagation && DOMManager_1.DOM.boxChecked("backward")) {
            console.log("______ Updated From __ " + this.label);
            this.propagateBackward2(this, true);
        }
    };
    Node.prototype.propagateForward2 = function (cat, clicked) {
        //console.log("____ cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)
        var _this = this;
        if (clicked) {
            //if (!cat.inFwdPropagation) {
            //console.log("-> 1 In prop " + cat.label)
            try {
                if (DOMManager_1.DOM.boxChecked("forward")) {
                    // i) retrive a subset of edges whose SOURCE is this category
                    cat.inFwdPropagation = clicked;
                    var edgesTmp = this.getForwardEdges(cat);
                    // ii) retrieve the list of TARGET categories linked to this category
                    edgesTmp.forEach(function (edg) {
                        if (edg.target == undefined) {
                            return false;
                        }
                        else {
                            var obs = edg.target;
                            // for each of those categories, repeat i), ii)
                            // console.log("__ To " + obs.label)
                            if (!obs.inFwdPropagation) {
                                obs.propagateForward2(obs, clicked);
                            }
                            else {
                                // in case this node is in propagation but was also clicked
                                if (obs.vNodeObserver.clicked) {
                                    console.log("Forward propagation stopped at node " +
                                        obs.label +
                                        ". Already in propagation chain");
                                }
                                // in case this node is not the end of the propagation branch.
                                else if (_this.getForwardEdges(obs).length != 0) {
                                    // console.log("Blocked successor propagation from " + cat.label + ".\n** Recursion Error thrown **")
                                    var nError = new Error(cat.label);
                                    nError.name = "Recursion";
                                    throw nError;
                                }
                            }
                        }
                    });
                }
            }
            catch (error) {
                if (error.name == "Recursion") {
                    alert("** RECURSIVE PROPAGATION **\nThere is a closed loop of successors that might crash the application. Successors propagation will be dissabled\nTry to delete the last edge (by pressing SHIFT+E)");
                    var box = DOMManager_1.DOM.boxChecked("forward");
                    box = "";
                }
                else if (error instanceof RangeError) {
                    alert("infinite forward propadation. \nThe path of successors from " +
                        cat.label +
                        " draws a closed loop. \nPropagation will be dissabled");
                    var box = DOMManager_1.DOM.boxChecked("forward");
                    box = "";
                }
                else {
                    console.log(error.name +
                        " Warning: error catched in forward propagation");
                }
            }
        }
        else if (cat.inFwdPropagation) {
            //** RESET CURRENT and ALL SUCCESSORS **
            cat.inFwdPropagation = false;
            try {
                var edgesTmp = this.getForwardEdges(cat);
                edgesTmp.forEach(function (edg) {
                    var obs = edg.target;
                    obs.propagateForward2(obs, false);
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.name == "Recursion") {
                        console.log(" ** End of prop for cat: " +
                            cat.label +
                            " fwd_Prop: " +
                            cat.inFwdPropagation +
                            " clicked: " +
                            clicked);
                    }
                }
                else {
                    console.log("Unknown error" + error);
                }
            }
        }
    };
    Node.prototype.propagateBackward2 = function (cat, clicked) {
        //console.log("____ cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)
        var _this = this;
        if (clicked) {
            // console.log("-> 1 In prop " + cat.label)
            try {
                if (DOMManager_1.DOM.boxChecked("backward")) {
                    // i) retrive a subset of edges whose TARGET is this category
                    cat.inBkwPropagation = clicked;
                    var edgesTmp = this.getBackwardEdges(cat);
                    // ii) retrieve the list of SOURCE categories linked to this category
                    edgesTmp.forEach(function (edg) {
                        if (edg.source == undefined) {
                            return false;
                        }
                        else {
                            var obs = edg.source;
                            // for each of those categories, repeat i), ii)
                            console.log("__ To " + obs.label);
                            if (!obs.inBkwPropagation) {
                                obs.propagateBackward2(obs, clicked);
                            }
                            else {
                                // in case this node is in propagation but was also clicked
                                if (obs.vNodeObserver.clicked) {
                                    console.log("Backward propagation stopped at node" +
                                        obs.label +
                                        ". Already in propagation chain");
                                }
                                // in case this node is not the end of the propagation branch.
                                else if (_this.getBackwardEdges(obs).length != 0) {
                                    console.log("Blocked predecessor propagation from " +
                                        cat.label +
                                        ".\n** Recursion Error thrown **");
                                    var nError = new Error(cat.label);
                                    nError.name = "Recursion";
                                    throw nError;
                                }
                            }
                        }
                    });
                }
            }
            catch (error) {
                if (error.name == "Recursion") {
                    alert("** RECURSIVE PROPAGATION **\nThere is a closed loop of predecessors that might crash the application. Predecessors propagation will be dissabled\nTry to delete the last edge (by pressing SHIFT+E)");
                    var box = DOMManager_1.DOM.boxChecked("backward");
                    box = "";
                }
                else if (error instanceof RangeError) {
                    alert("infinite backward propadation. \nThe path of predecessors from " +
                        cat.label +
                        " draws a closed loop. \nPropagation will be dissabled");
                    var box = DOMManager_1.DOM.boxChecked("backward");
                    box = "";
                }
                else {
                    console.log(error.name +
                        " Warning: error catched in backward propagation");
                }
            }
        }
        else if (cat.inBkwPropagation) {
            //** RESET CURRENT and ALL SUCCESSORS **
            cat.inBkwPropagation = false;
            try {
                var edgesTmp = this.getBackwardEdges(cat);
                edgesTmp.forEach(function (edg) {
                    var obs = edg.source;
                    obs.propagateBackward2(obs, false);
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.name == "Recursion") {
                        console.log(" ** End of prop for cat: " +
                            cat.label +
                            " fwd_Prop: " +
                            cat.inBkwPropagation +
                            " clicked: " +
                            clicked);
                    }
                }
                else {
                    console.log("Unknown error");
                }
            }
        }
    };
    /******** BUILD EDGE ******** */
    /** Work in the last edge if any. If there is a last edge, and it is open, then close it.
     * If there is no edge, or the edge is closed, create a new one.
     * */
    Node.prototype.workOnEdgeBuffer = function () {
        var buffEdge;
        if (DOMManager_1.DOM.boxChecked("edit")) {
            // get the edge un EdgeFactory buffer
            buffEdge = edgeFactory_1.EdgeFactory.getBufferEdge();
            // If there is at least one edge
            if (buffEdge) {
                // if the edge is open
                if (buffEdge.open) {
                    this.closeEdge(buffEdge);
                }
                else {
                    // retrieve the connector type choosen value on the Contextual Menu
                    var kind = ContextualGUI_1.ContextualGUI.edgeMenuChoice;
                    if (kind == undefined) {
                        kind = "default";
                    }
                    if (window.confirm("Node | New connector kind: " + kind)) {
                        buffEdge = this.sproutEdge(kind);
                    }
                    else {
                        return;
                    }
                }
            }
            else {
                // retrieve the connector type choosen value on the Contextual Menu
                var kind = void 0;
                if (ContextualGUI_1.ContextualGUI.edgeMenuChoice) {
                    kind = ContextualGUI_1.ContextualGUI.edgeMenuChoice;
                }
                if (kind == undefined) {
                    kind = "default";
                }
                if (window.confirm("Node | New connector kind: " + kind)) {
                    buffEdge = this.sproutEdge(kind);
                }
                else {
                    return;
                }
            }
        }
        return buffEdge;
    };
    Node.prototype.sproutEdge = function (kind) {
        // create a new one
        var buffEdge = new edge_1.Edge(this);
        edgeFactory_1.EdgeFactory.setBufferEdge(buffEdge);
        // link edge to connector and set edge's kind
        var connector = this.sproutConnector(kind);
        connector.subscribeEdgeObserver(buffEdge);
        return buffEdge;
    };
    Node.prototype.sproutConnector = function (kind) {
        // look if there is a connector of this kind
        var connectorList = this.connectors.filter(function (cnctr) { return cnctr.kind === kind; });
        var connector = connectorList[0];
        // if this is a new kind of connector
        if (!connector) {
            // instantiate the connector and add it to this node
            var index = this.connectors.length;
            connector = this.addConnector(kind, index);
            // Notify vNode to create vConnector (and vEdge?)
            this.vNodeObserver.fromNode(connector);
        }
        return connector;
    };
    Node.prototype.popConnector = function (kind) {
        // look if there is a connector of this kind
        var connectorList = this.connectors.filter(function (cnctr) { return cnctr.kind === kind; });
        var connector = connectorList[0];
        // if there is a connector
        if (connector) {
            // if the connector is linked to no more than one edges
            if (connector.edgeObservers.length <= 1)
                // pop the connector and the vConnector
                console.log("delete connector " + connector.kind);
            this.removeConnector(connector);
        }
    };
    Node.prototype.destroyConnector = function (kind) {
        // look if there is a connector of this kind
        var connectorList = this.connectors.filter(function (cnctr) { return cnctr.kind === kind; });
        var connector = connectorList[0];
        // if there is a connector
        if (connector) {
            // if the connector is linked to no more than one edges
            if (connector.edgeObservers.length <= 1)
                // pop the connector and the vConnector
                this.removeConnector(connector);
        }
    };
    Node.prototype.closeEdge = function (buffEdge) {
        // set target
        if (buffEdge.setTarget(this)) {
            var connector = this.sproutConnector(buffEdge.kind);
            connector.subscribeEdgeObserver(buffEdge);
            // close edge
            buffEdge.open = false;
        }
        else {
            console.log("Issues closing edge");
        }
    };
    Node.prototype.recallEdge = function () {
        // remove temporary edge
        edgeFactory_1.EdgeFactory._edges.pop();
        //vEdges.pop();
        this.taken = false;
    };
    Node.prototype.getForwardEdges = function (cat) {
        var edgesTmp = [];
        edgeFactory_1.EdgeFactory._edges.forEach(function (edg) {
            var obs = edg.source;
            if (obs.idCat === cat.idCat) {
                // console.log(obs.label);
                edgesTmp.push(edg);
            }
        });
        return edgesTmp;
    };
    Node.prototype.getBackwardEdges = function (cat) {
        var edgesTmp = [];
        edgeFactory_1.EdgeFactory._edges.forEach(function (edg) {
            var obs = edg.target;
            if (obs.idCat === cat.idCat) {
                // console.log(obs.label);
                edgesTmp.push(edg);
            }
        });
        return edgesTmp;
    };
    /** This is not being used at this point because the json us made by the vNode */
    Node.prototype.getJSON = function () {
        var cnctrs = [];
        for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
            var connector = _a[_i];
            cnctrs.push(connector.getJSON());
        }
        var rtn = {
            id: this.idCat.index,
            nodeLabel: this.label,
            nodeDescription: this.description,
            nodeAttributes: this.attributes,
            connectors: JSON.stringify(cnctrs),
            pajekIndex: this.idCat.pajekIndex,
        };
        return rtn;
    };
    return Node;
}());
exports.Node = Node;
