/**
 * The node has connectors. each connector is of a different type, so each kind of connectors have its own collection, 
 * grouped in a single collection
 * @param clusterID: the cluster to which this node belongs to
 * @param _index: the index in this cluster
 * @param _count: the pajeckIndex
 * @param _data: data about connectors or any other kind of data
 */
class Node {
    constructor(clusterID, _data, _count) {
        this.idCat = { cluster: clusterID, index: _data.id, pajekIndex: _count }
        this.connectors = []
        this.label = "void";
        this.description = "No description yet";
        this.inFwdPropagation = false;
        this.inBkwPropagation = false;
        this.vNodeObserver;
        this.importedVNodeData;
    }

    subscribe(vNode) {
        this.vNodeObserver = vNode;
    }

    addConnector(kind, index) {
        let tmpConnector = new Connector(this.idCat, kind, index);
        this.connectors.push(tmpConnector);
        return tmpConnector;
    }

    setLabel(label) {
        this.label = label;
    }

    setDescription(description) {
        this.description = description;
    }

    setImportedVNodeData(obj) {
        this.importedVNodeData = obj;
    }

    getConnectors() {
        return this.connectors;
    }

    resetConnectors() {
        this.connectors = [];
        this.vNodeObserver.resetVConnectors();
    }

    propagate(node, clicked) {
        console.log("__ From __ " + this.label);
        this.propagateForward2(node, clicked);
        this.propagateBackward2(node, clicked);
    }

    updatePropagation2() {
        if (this.inFwdPropagation && document.getElementById('forward').checked) {
            console.log("______ Updated From __ " + this.label);
            this.propagateForward2(this, true);
        }
        if (this.inBkwPropagation && document.getElementById('backward').checked) {
            console.log("______ Updated From __ " + this.label);
            this.propagateBackward2(this, true);
        }
    }

    propagateForward2(cat, clicked) {

        //console.log("____ cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)

        if (clicked) {
            //if (!cat.inFwdPropagation) {
            // console.log("-> 1 In prop " + cat.label)
            try {
                if (document.getElementById('forward').checked) {
                    // i) retrive a subset of edges whose SOURCE is this category
                    cat.inFwdPropagation = clicked;
                    let edgesTmp = this.getForwardEdges(cat);

                    // ii) retrieve the list of TARGET categories linked to this category
                    edgesTmp.forEach(edg => {
                        if (edg.target == undefined) {
                            return false;
                        } else {
                            let obs = edg.target.nodeObserver;
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
                    document.getElementById('forward').checked = "";
                } else if (error instanceof RangeError) {
                    alert("infinite forward propadation. \nThe path of successors from " + cat.label + " draws a closed loop. \nPropagation will be dissabled");
                    document.getElementById('forward').checked = "";
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
                    let obs = edg.target.nodeObserver;
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
                if (document.getElementById('backward').checked) {
                    // i) retrive a subset of edges whose TARGET is this category
                    cat.inBkwPropagation = clicked;
                    let edgesTmp = this.getBackwardEdges(cat);

                    // ii) retrieve the list of SOURCE categories linked to this category
                    edgesTmp.forEach(edg => {
                        if (edg.source == undefined) {
                            return false;
                        } else {
                            let obs = edg.source.nodeObserver;
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
                    document.getElementById('backward').checked = "";
                } else if (error instanceof RangeError) {
                    alert("infinite backward propadation. \nThe path of predecessors from " + cat.label + " draws a closed loop. \nPropagation will be dissabled");
                    document.getElementById('backward').checked = "";
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
                    let obs = edg.source.nodeObserver;
                    obs.propagateBackward2(obs, false);
                });
            } catch {
                if (error.name == "Recursion") {
                    console.log(" ** End of prop for cat: " + cat.label + " fwd_Prop: " + cat.inBkwPropagation + " clicked: " + clicked)

                }
            }
        }
    }


    /**  @deprecated */
    propagateForward(cat, clicked) {

        console.log("____ cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)

        if (clicked) {
            if (!cat.inFwdPropagation) {
                // console.log("-> 1 In prop " + cat.label)
                try {
                    // i) retrive a subset of edges whose SOURCE is this category
                    cat.inFwdPropagation = clicked;
                    let edgesTmp = this.getForwardEdges(cat);

                    // ii) retrieve the list of TARGET categories linked to this category
                    edgesTmp.forEach(edg => {
                        if (edg.target == undefined) {
                            return false;
                        } else {
                            let obs = edg.target.nodeObserver;

                            // for each of those categories, repeat i), ii)
                            console.log("__ To " + obs.label)
                            obs.propagateForward(obs, clicked);
                        }
                    });
                } catch (error) {
                    if (error.name == "Recursion") {
                        alert("INFINTE RECURSION. \n The path of successors from " + error.message + " draws a closed loop. Propagation will be dissabled");
                        document.getElementById('forward').checked = "";
                    } else if (error instanceof RangeError) {
                        document.getElementById('warning').innerHTML = "WARNING: Infinite Recursion. Propagation dissabled";
                        console.log("WARNING: INFINTE RECURSION. The path draws a closed loop. Check: " + cat.label);
                        alert("Forward infinite recursion. \nThe path of successors from " + cat.label + " draws a closed loop. Propagation will be dissabled");
                        document.getElementById('forward').checked = "";
                    } else {
                        console.log(error)
                    }
                }
            } else {
                console.log("Blocked successor propagation from " + cat.label + ". ** Recursion Error thrown **")
                let nError = new Error(cat.label);
                nError.name = "Recursion"
                throw (nError);
            }
        } else {
            console.log(" ** RESET ALL SUCCESSORS **")
                //** RESET CURRENT and ALL SUCCESSORS **
            cat.inFwdPropagation = false;
            let edgesTmp = this.getForwardEdges(cat);
            edgesTmp.forEach(edg => {
                let obs = edg.target.nodeObserver;
                obs.propagateForward(obs, clicked);
            });
            console.log(" ** End of prop for cat: " + cat.label + " fwd_Prop: " + cat.inFwdPropagation + " clicked: " + clicked)

        }
    }


    ////******** BUILD EDGE ******** */

    /** Work in the last edge if any. If there is a last edge, and it is open, then close it. 
     * If there is no edge, or the edge is closed, create a new one. 
     * */
    workOnLastEdge() {
        let lastEdge;
        if (DOM.boxChecked("edit")) {

            // get the last edge in edges collection.
            lastEdge = EdgeFactory.EDGES.slice(-1)[0];

            // If there is at least one edge
            if (lastEdge) {
                // if the edge is open
                if (lastEdge.open) {
                    alert("Closing edge of type " + lastEdge.kind);
                    this.closeEdge(lastEdge);
                } else {
                    // choose connector type
                    alert("New connector type PROVISIONAL");
                    let kind = "Provisional";
                    lastEdge = this.sproutEdge(kind);
                }
            } else {
                // create the first edge
                // choose connector type
                alert("New connector type PROVISIONAL");
                let kind = "Provisional";
                lastEdge = this.sproutEdge(kind);
            }
        }
        return lastEdge;
    }

    sproutEdge(kind) {
        // create a new one
        let lastEdge = new Edge(this);
        EdgeFactory.edges.push(lastEdge);

        // link edge to connector and set edge's kind
        let connector = this.sproutConnector(kind);
        connector.subscribeEdgeObserver(lastEdge);
        return lastEdge;
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

    closeEdge(lastEdge) {
        // set target
        if (lastEdge.setTarget(this)) {
            this.sproutConnector(lastEdge.kind);
            // close edge
            lastEdge.open = false;
        } else {
            console.log("Issues closing edge");
            this.recallEdge(lastEdge);
        }
    }

    recallEdge() {
        // remove temporary edge
        EdgeFactory.edges.pop();

        //vEdges.pop();
        this.taken = false;
    }

    getForwardEdges(cat) {
        let edgesTmp = [];
        EdgeFactory.edges.forEach(edg => {
            let obs = edg.source.nodeObserver;
            if (obs.idCat === cat.idCat) {
                // console.log(obs.label);
                edgesTmp.push(edg);
            }
        });
        return edgesTmp;
    }

    getBackwardEdges(cat) {
        let edgesTmp = [];
        EdgeFactory.edges.forEach(edg => {
            let obs = edg.target.nodeObserver;
            if (obs.idCat === cat.idCat) {
                // console.log(obs.label);
                edgesTmp.push(edg);
            }
        });
        return edgesTmp;
    }

    getJSON() {
        let cnctrs = [];
        for (const connector of this.connectors) {
            cnctrs.push(connector.getJSON())
        }

        let rtn = {
            id: this.idCat.index,
            nodeLabel: this.label,
            nodeDescription: this.description,
            connectors: JSON.stringify(cnctrs),
            pajekIndex: this.idCat.pajekIndex
        }
        return rtn;
    }
}