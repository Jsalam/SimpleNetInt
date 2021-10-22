/**
 * The node has connectors. each connector is of a different type, so each kind of connectors have its own collection, 
 * grouped in a single collection
 * @param clusterID: the cluster to which this node belongs to
 * @param _indexInCluster: the index in this cluster
 * @param _count: the pajekIndex
 */
class Node {
    constructor(clusterID, _indexInCluster, _count) {
        this.idCat = { cluster: clusterID, index: _indexInCluster, pajekIndex: _count }
        this.connectors = []
        this.label = "void";
        this.description = "No description yet";
        this.nodeShortDescription = "No description yet";
        this.attributes;
        this.inFwdPropagation = false;
        this.inBkwPropagation = false;
        this.vNodeObserver;
        this.importedVNodeData;
    }

    /**** OBSERVER ****/
    subscribe(vNode) {
        this.vNodeObserver = vNode;
    }

    /**** FILTERS *****/
    /**
     * This method matches the user selections on the gui with the connectors of this node. 
     * If any, the corresponding VConnector AND VNODE are marked as selected.
     * This method should be handled by the VNode subcribed to this node
     */
    filterConnectors() {
        // on a DOM Event (similar to contextualGUI)/ this should be handled by the VNode subcribed to this node
        let filteredConnectors = this.connectors.filter(function(cnctr) {
            let rtn = false;

            // mark vConnector as unselected
            cnctr.vConnectorObserver.selected = false;

            // iterate over the gui checkboxes
            for (const ckbx of DOM.currentCheckboxes) {

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
        } else {
            this.vNodeObserver.selected = false;
        }
        return filteredConnectors;
    }

    /**** CONNECTORS ****/
    /** Adds a connector to the collection of this node
     * @param {String} kind kind of connector
     * @param {Number} index index for connector ID
     */
    addConnector(kind, index) {
        let tmpConnector = new Connector(this.idCat, kind, index);
        this.connectors.push(tmpConnector);
        return tmpConnector;
    }

    /** Finds an edge and removes it from the collection of connectors observers
     * @param {Edge} edge the edge to be removed
     */
    disconnectEdge(edge) {
        // for each connector
        for (const conn of this.connectors) {
            // go over the edgeObservers collection
            for (let i = 0; i < conn.edgeObservers.length; i++) {
                let obs = conn.edgeObservers[i];
                // if one of the edges is equal to the edge of this vEdge
                if (obs.equals(edge)) {
                    // remove that element from the collection
                    conn.edgeObservers.splice(i, 1);
                }
            }
        }
    }

    /** Removes a connector matching the given connector from the connectors observers
     * @param {Connector} conn the connector to be removed
     */
    removeConnector(conn) {
        this.connectors = this.connectors.filter(function(cnctr) {
            let rtn = true;
            if (cnctr.equals(conn)) {
                if (cnctr.edgeObservers.length <= 1) {
                    rtn = false
                }
            }
            // removes connector if false
            return rtn;
        })
    }

    /** gets all the connectors 
     * 
     */
    getConnectors() {
        return this.connectors;
    }

    /** resets this connectros and observer vNode vConnectors
     * 
     */
    resetConnectors() {
        this.connectors = [];
        this.vNodeObserver.resetVConnectors();
    }

    /**** ATTRIBUTES ****/
    setLabel(label) {
        this.label = label;
    }

    setDescription(description) {
        this.description = description;
    }

    setNodeShortDescription(description) {
        this.nodeShortDescription = description;
    }

    setAttributes(attributes) {
        this.attributes = attributes;
    }

    setImportedVNodeData(obj) {
        this.importedVNodeData = obj;
    }

    /**** PROPAGATION ****/
    propagate(node, clicked) {
        console.log("__ From __ " + this.label);
        this.propagateForward2(node, clicked);
        this.propagateBackward2(node, clicked);
    }

    updatePropagation2() {
        if (this.inFwdPropagation && DOM.boxChecked('forward')) {
            console.log("______ Updated From __ " + this.label);
            this.propagateForward2(this, true);
        }
        if (this.inBkwPropagation && DOM.boxChecked('backward')) {
            console.log("______ Updated From __ " + this.label);
            this.propagateBackward2(this, true);
        }
    }

    propagateForward2(cat, clicked) {

        //console.log("____ cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)

        if (clicked) {
            //if (!cat.inFwdPropagation) {
            //console.log("-> 1 In prop " + cat.label)
            try {
                if (DOM.boxChecked('forward')) {
                    // i) retrive a subset of edges whose SOURCE is this category
                    cat.inFwdPropagation = clicked;
                    let edgesTmp = this.getForwardEdges(cat);

                    // ii) retrieve the list of TARGET categories linked to this category
                    edgesTmp.forEach(edg => {
                        if (edg.target == undefined) {
                            return false;
                        } else {
                            let obs = edg.target;
                            // for each of those categories, repeat i), ii)
                            // console.log("__ To " + obs.label)
                            if (!obs.inFwdPropagation) {
                                obs.propagateForward2(obs, clicked);
                            } else {
                                // in case this node is in propagation but was also clicked
                                if (obs.vNodeObserver.clicked) {
                                    console.log("Forward propagation stopped at node " + obs.label + ". Already in propagation chain")
                                }
                                // in case this node is not the end of the propagation branch.
                                else if (this.getForwardEdges(obs).length != 0) {
                                    // console.log("Blocked successor propagation from " + cat.label + ".\n** Recursion Error thrown **")
                                    let nError = new Error(cat.label);
                                    nError.name = "Recursion"
                                    throw (nError);
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                if (error.name == "Recursion") {
                    alert("** RECURSIVE PROPAGATION **\nThere is a closed loop of successors that might crash the application. Successors propagation will be dissabled\nTry to delete the last edge (by pressing SHIFT+E)");
                    let box = DOM.boxChecked('forward');
                    box = ""
                } else if (error instanceof RangeError) {
                    alert("infinite forward propadation. \nThe path of successors from " + cat.label + " draws a closed loop. \nPropagation will be dissabled");
                    let box = DOM.boxChecked('forward')
                    box = "";
                } else {
                    console.log(error.name + " Warning: error catched in forward propagation")
                }
            }
        } else if (cat.inFwdPropagation) {
            //** RESET CURRENT and ALL SUCCESSORS **
            cat.inFwdPropagation = false;
            try {
                let edgesTmp = this.getForwardEdges(cat);
                edgesTmp.forEach(edg => {
                    let obs = edg.target;
                    obs.propagateForward2(obs, false);
                });
            } catch {
                if (error.name == "Recursion") {
                    console.log(" ** End of prop for cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)

                }
            }
        }
    }

    propagateBackward2(cat, clicked) {

        //console.log("____ cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)

        if (clicked) {
            // console.log("-> 1 In prop " + cat.label)
            try {
                if (DOM.boxChecked('backward')) {
                    // i) retrive a subset of edges whose TARGET is this category
                    cat.inBkwPropagation = clicked;
                    let edgesTmp = this.getBackwardEdges(cat);

                    // ii) retrieve the list of SOURCE categories linked to this category
                    edgesTmp.forEach(edg => {
                        if (edg.source == undefined) {
                            return false;
                        } else {
                            let obs = edg.source;
                            // for each of those categories, repeat i), ii)
                            console.log("__ To " + obs.label)
                            if (!obs.inBkwPropagation) {
                                obs.propagateBackward2(obs, clicked);
                            } else {
                                // in case this node is in propagation but was also clicked
                                if (obs.vNodeObserver.clicked) {
                                    console.log("Backward propagation stopped at node" + obs.label + ". Already in propagation chain")
                                }
                                // in case this node is not the end of the propagation branch.
                                else if (this.getBackwardEdges(obs).length != 0) {
                                    console.log("Blocked predecessor propagation from " + cat.label + ".\n** Recursion Error thrown **")
                                    let nError = new Error(cat.label);
                                    nError.name = "Recursion"
                                    throw (nError);
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                if (error.name == "Recursion") {
                    alert("** RECURSIVE PROPAGATION **\nThere is a closed loop of predecessors that might crash the application. Predecessors propagation will be dissabled\nTry to delete the last edge (by pressing SHIFT+E)");
                    let box = DOM.boxChecked('backward');
                    box = "";
                } else if (error instanceof RangeError) {
                    alert("infinite backward propadation. \nThe path of predecessors from " + cat.label + " draws a closed loop. \nPropagation will be dissabled");
                    let box = DOM.boxChecked('backward');
                    box = "";
                } else {
                    console.log(error.name + " Warning: error catched in backward propagation")
                }
            }
        } else if (cat.inBkwPropagation) {
            //** RESET CURRENT and ALL SUCCESSORS **
            cat.inBkwPropagation = false;
            try {
                let edgesTmp = this.getBackwardEdges(cat);
                edgesTmp.forEach(edg => {
                    let obs = edg.source;
                    obs.propagateBackward2(obs, false);
                });
            } catch {
                if (error.name == "Recursion") {
                    console.log(" ** End of prop for cat: " + cat.label + " fwd_Prop: " + cat.inBkwPropagation + " clicked: " + clicked)

                }
            }
        }
    }

    /******** BUILD EDGE ******** */

    /** Work in the last edge if any. If there is a last edge, and it is open, then close it. 
     * If there is no edge, or the edge is closed, create a new one. 
     * */
    workOnEdgeBuffer() {
        let buffEdge;
        if (DOM.boxChecked("edit")) {

            // get the edge un EdgeFactory buffer
            buffEdge = EdgeFactory.getBufferEdge();

            // If there is at least one edge
            if (buffEdge) {

                // if the edge is open
                if (buffEdge.open) {
                    this.closeEdge(buffEdge);
                } else {
                    // retrieve the connector type choosen value on the Contextual Menu
                    let kind = ContextualGUI.edgeMenuChoice;
                    if (kind == undefined) {
                        kind = "default";
                    }
                    alert("Node | New connector kind: " + kind);
                    buffEdge = this.sproutEdge(kind);

                }
            } else {
                // retrieve the connector type choosen value on the Contextual Menu
                let kind;
                if (ContextualGUI.edgeMenuChoice) {
                    kind = ContextualGUI.edgeMenuChoice;
                }
                if (kind == undefined) {
                    kind = "default";
                }
                alert("Node | New connector kind: " + kind);
                buffEdge = this.sproutEdge(kind);

            }
        }
        return buffEdge;
    }

    sproutEdge(kind) {
        // create a new one
        let buffEdge = new Edge(this);
        EdgeFactory.setBufferEdge(buffEdge);

        // link edge to connector and set edge's kind
        let connector = this.sproutConnector(kind);
        connector.subscribeEdgeObserver(buffEdge);
        return buffEdge;
    }

    sproutConnector(kind) {
        // look if there is a connector of this kind
        let connectorList = this.connectors.filter(cnctr => cnctr.kind === kind);
        let connector = connectorList[0];

        // if this is a new kind of connector
        if (!connector) {
            // instantiate the connector and add it to this node
            let index = this.connectors.length;
            connector = this.addConnector(kind, index);
            // Notify vNode to create vConnector (and vEdge?)
            this.vNodeObserver.fromNode(connector);
        }
        return connector;
    }

    popConnector(kind) {
        // look if there is a connector of this kind
        let connectorList = this.connectors.filter(cnctr => cnctr.kind === kind);
        let connector = connectorList[0];

        // if there is a connector 
        if (connector) {
            // if the connector is linked to no more than one edges
            if (connector.edgeObservers.length <= 1) {
                // pop the connector and the vConnector
                this.removeConnector(connector);
            }
        }
    }

    destroyConnector(kind) {
        // look if there is a connector of this kind
        let connectorList = this.connectors.filter(cnctr => cnctr.kind === kind);
        let connector = connectorList[0];

        // if there is a connector 
        if (connector) {
            // if the connector is linked to no more than one edges
            if (connector.edgeObservers.length <= 1)
            // pop the connector and the vConnector
                this.removeConnector(connector);
        }
    }

    closeEdge(buffEdge) {
        // set target
        if (buffEdge.setTarget(this)) {
            this.sproutConnector(buffEdge.kind);
            // close edge
            buffEdge.open = false;
        } else {
            console.log("Issues closing edge");
        }

    }

    recallEdge() {
        // remove temporary edge
        EdgeFactory._edges.pop();

        //vEdges.pop();
        this.taken = false;
    }

    getForwardEdges(cat) {
        let edgesTmp = [];
        EdgeFactory._edges.forEach(edg => {
            let obs = edg.source;
            if (obs.idCat === cat.idCat) {
                // console.log(obs.label);
                edgesTmp.push(edg);
            }
        });
        return edgesTmp;
    }

    getBackwardEdges(cat) {
        let edgesTmp = [];
        EdgeFactory._edges.forEach(edg => {
            let obs = edg.target;
            if (obs.idCat === cat.idCat) {
                // console.log(obs.label);
                edgesTmp.push(edg);
            }
        });
        return edgesTmp;
    }

    equalsTo(node) {
        let rtn = false;
        if (this.idCat.cluster === node.idCat.cluster) {
            //console.log("same cluster: " + this.idCat.cluster);
            if (this.idCat.index === node.idCat.index) {
                //  console.log("same cluster and same index: " + this.idCat.index);
                rtn = true;
                if (this.idCat.pajekIndex === node.idCat.pajekIndex) {
                    // console.log("same cluster, index and pajek: " + this.idCat.pajekIndex);
                    //rtn = true;
                }
            }
        }
        return rtn;
    }

    /** This is not being used at this point because the json is made by the vNode */
    getJSON() {
        let cnctrs = [];
        for (const connector of this.connectors) {
            cnctrs.push(connector.getJSON())
        }

        let rtn = {
            id: this.idCat.index,
            nodeLabel: this.label,
            nodeShortDescription: this.nodeShortDescription,
            nodeDescription: this.description,
            nodeAttributes: this.attributes,
            connectors: JSON.stringify(cnctrs),
            pajekIndex: this.idCat.pajekIndex
        }
        return rtn;
    }
}