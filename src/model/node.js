class Node {
    constructor(clusterID, _index, _count) {
        this.idCat = { cluster: clusterID, index: _index, pajekIndex: _count}
        this.positives = [];
        this.negatives = [];
        this.label = "void";
        this.description = "No description yet";
        this.inFwdPropagation = false;
        this.inBkwPropagation = false;
        this.vNodeObserver;
        this.polarity;
    }

    subscribe(vNode) {
        this.vNodeObserver = vNode;
    }


    addPositiveConnector(index) {
        let tmpConnector = new Connector(this.idCat, index, true, this.idCat.pajekIndex);
        tmpConnector.subscribeNode(this);
        this.positives.push(tmpConnector);
        return tmpConnector;
    }

    addNegativeConnector(index) {
        let tmpConnector = new Connector(this.idCat, index, false, this.idCat.pajekIndex);
        tmpConnector.subscribeNode(this);
        this.negatives.push(tmpConnector);
        return tmpConnector;
    }

    popLastConnector(polarity) {
        if (polarity == true) {
            this.positives.pop();
        } else {
            this.negatives.pop();
        }
        this.vNodeObserver.popLastVConnector(polarity)
    }

    setPolarity(polarity) {
        this.polarity = polarity;
    }

    setLabel(label) {
        this.label = label;
    }

    setDescription(description) {
        this.description = description;
    }

    getConnectors(polarity) {
        if (polarity) {
            return this.positives;
        } else {
            return this.negatives;
        }
    }

    splitConnectors(edge) {
        let connSource = edge.source;
        let connTarget = edge.target; // might be undefined
        if (!connSource.taken) {
            this.recallConnectors(connSource);
        } else {

            if (edge.open) {
                if (connSource.polarity == true) {
                    let conctr = connSource.nodeObserver.addPositiveConnector(this.positives.length);
                    this.vNodeObserver.addPositiveVConnector(conctr);
                } else {
                    let conctr = connSource.nodeObserver.addNegativeConnector(this.negatives.length);
                    this.vNodeObserver.addNegativeVConnector(conctr);
                }

            } else {
                if (connTarget) {
                    if (connTarget.nodeObserver.idCat == this.idCat) {
                        if (connTarget.polarity == true) {
                            let conctr = this.addPositiveConnector(this.positives.length);
                            this.vNodeObserver.addPositiveVConnector(conctr);
                        } else {
                            let conctr = this.addNegativeConnector(this.negatives.length);
                            this.vNodeObserver.addNegativeVConnector(conctr);
                        }
                    }
                }
            }
        }
        this.updatePropagation2()
    }

    resetConnectors() {
        this.positives = [];
        this.negatives = [];

        if (this.polarity == "RIGHT") {
            this.addPositiveConnector(0);
        }
        if (this.polarity == "LEFT") {
            this.addNegativeConnector(0);
        }
        if (this.polarity == "BOTH") {
            this.addPositiveConnector(0);
            this.addNegativeConnector(0);
        }
        this.vNodeObserver.resetVConnectors();
    }

    recallConnectors(connSource) {
        if (connSource.polarity) {
            this.positives.pop();
            connSource.nodeObserver.vNodeObserver.vPositives.pop();
        } else {
            this.negatives.pop();
            connSource.nodeObserver.vNodeObserver.vNegatives.pop();
        }
        connSource.nodeObserver.vNodeObserver.updateConnectorsCoords();
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
                            console.log("__ To " + obs.label)
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
            }
            catch (error) {
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
        }
        else if (cat.inFwdPropagation) {
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
            }
            catch (error) {
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
        }
        else if (cat.inBkwPropagation) {
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
                }
                catch (error) {
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

    /**  @deprecated */
    propagateBackward(cat, clicked) {
        let warningAt;
        if (!cat.inBkwPropagation || !clicked) {
            try {
                // i) retrive a subset of edges whose TARGET is this category
                cat.inBkwPropagation = clicked;
                let edgesTmp = this.getBackwardEdges(cat)

                // ii) retrieve the list of source categories linked to this category
                edgesTmp.forEach(edg => {
                    if (edg.target == undefined) {
                        return false;
                    } else {
                        let obs = edg.source.nodeObserver;
                        warningAt = obs.label;

                        // for each of those categories, repeat i), ii)
                        obs.propagateBackward(obs, clicked);
                    }
                });
            } catch (error) {
                if (error.name == "Recursion") {
                    alert("INFINTE RECURSION. \n The path of predecessors from " + error.message + " draws a closed loop. Propagation will be dissabled");
                    document.getElementById('forward').checked = "";
                } else if (error instanceof RangeError) {
                    document.getElementById('warning').innerHTML = "WARNING: Infinite Recursion. Propagation dissabled";
                    console.log("WARNING: INFINTE RECURSION. The path draws a closed loop. Check: " + cat.label);
                    alert("Backward infinite recursion. \nThe path of predecessors from " + cat.label + " draws a closed loop. Propagation will be dissabled");
                    document.getElementById('forward').checked = "";
                } else {
                    console.log(error)
                }
            }
        }
        else {
            console.log("Blocked predecessor propagation from " + cat.label + ". ** Recursion Error thrown **")
            let nError = new Error(cat.label);
            nError.name = "Recursion"
            throw (nError);
        }
    }

    /**  @deprecated */
    updatePropagation() {
        if (this.inFwdPropagation && document.getElementById('forward').checked) {
            this.inFwdPropagation = false;
            console.log("______ Updated From __ " + this.label);
            this.propagateForward(this, true);
        }
        if (this.inBkwPropagation && document.getElementById('backward').checked) {
            this.inBkwPropagation = false;
            console.log("______ Updated From __ " + this.label);
            this.propagateBackward(this, true);
        }
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
        let rtn = {
            id: this.idCat.index,
            nodeLabel: this.label,
            nodeDescription: this.description,
            polarity: this.polarity,
            pajekIndex: this.idCat.pajekIndex
        }
        return rtn;
    }
}