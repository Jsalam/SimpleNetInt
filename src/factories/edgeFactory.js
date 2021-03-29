class EdgeFactory {

    static buildEdges(edgs, clusters) {

        for (let index = 0; index < Object.keys(edgs).length; index++) {

            // take the source ID: cluster, cat and polarity
            let e = edgs[index];

            // get source node
            let cluster = ClusterFactory.getCluster(e.source.cluster);
            let source = cluster.getNode(e.source.pajekIndex);
            let sourceConnector = source.connectors.filter(cnctr => cnctr.kind == e.kind)[0];

            // get target node
            cluster = ClusterFactory.getCluster(e.target.cluster);

            let target = cluster.getNode(e.target.pajekIndex);

            let targetConnector = target.connectors.filter(cnctr => cnctr.kind == e.kind)[0];

            // get vSource
            let vSource = ClusterFactory.getVNodeOf(source)

            // get vTarget
            let vTarget = ClusterFactory.getVNodeOf(target)

            // make Edge and set target and weight
            let edge = new Edge(source);
            edge.setTarget(target);
            edge.weight = e.weight;

            // subscribe to source and target's connector. This sets the edge kind
            sourceConnector.subscribeEdgeObserver(edge);
            targetConnector.subscribeEdgeObserver(edge);

            // make VEdge
            let vEdge = new VEdge(edge);

            // set VNodes
            vEdge.setVSource(vSource);
            vEdge.setVTarget(vTarget);

            // Push Edge
            EdgeFactory.pushEdge(edge);
            EdgeFactory.pushVEdge(vEdge);
            Canvas.subscribe(vEdge);
        }
    }

    static reset() {
        EdgeFactory._edges = [];
        EdgeFactory._vEdges = [];
    }

    static deleteLastVEdge() {

        // remove the last vEdge from the collection
        let lastVEdge = EdgeFactory._vEdges.pop();

        // delete corresponding edge
        EdgeFactory._edges.pop();

        if (lastVEdge) {

            // remove connectors from its vNodes
            lastVEdge.vSource.popVConnector(lastVEdge.edge.kind);
            lastVEdge.vTarget.popVConnector(lastVEdge.edge.kind);

            // unsubscribe vEdge from canvas
            Canvas.unsubscribe(lastVEdge);
        }
    }

    static deleteEdge(edge) {
        // find the corresponding vEdge
        let tmpEdge = EdgeFactory.contains(EdgeFactory._edges, edge);
        let tmpVEdge = EdgeFactory.retrieveVEdgeForEdge(tmpEdge);
        let indexOf = EdgeFactory._vEdges.indexOf(tmpVEdge);

        // extract the VEdge from the collections
        let removedVEdge = EdgeFactory._vEdges.splice(indexOf, 1)[0];

        // delete corresponding edge
        indexOf = EdgeFactory._edges.indexOf(edge);
        let removedEdge = EdgeFactory._edges.splice(indexOf, 1)[0];

        removedEdge = undefined;

        // remove connectors from its vNodes
        if (removedVEdge) {

            // eliminate unliked connectors
            removedVEdge.vSource.destroyVConnector(removedVEdge.edge);
            removedVEdge.vTarget.destroyVConnector(removedVEdge.edge);

            // unsubscribe vEdge from canvas
            Canvas.unsubscribe(removedVEdge);
            //     console.log("done")
        }
    }

    static retrieveVEdgeForEdge(edgeA) {
        let rtn = false;
        let element;
        if (EdgeFactory._vEdges.length > 0) {
            element = EdgeFactory._vEdges.filter(function(vEdgeB) {
                let edgeB = vEdgeB.edge;
                if (EdgeFactory.compareEdges(edgeA, edgeB)) return true;
            })[0];
        }
        if (element) rtn = element;
        return rtn;

    }

    static isThereOpenEdge() {
        let rtn = false;
        if (EdgeFactory._vEdgeBuffer) {
            rtn = true;
        }
        return rtn;
    }

    static pushEdge(edge) {
        if (edge instanceof Edge) {
            let edgeInList = EdgeFactory.contains(EdgeFactory._edges, edge);
            if (edgeInList) {
                console.log("Duplicated edge. Weight increased by 1")
                edgeInList.increaseWeight();

            } else {
                EdgeFactory._edges.push(edge);
            }
        }
    }

    static pushVEdge(vEdge) {
        if (vEdge instanceof VEdge) {
            let vEdgeInList = !EdgeFactory.contains(EdgeFactory._vEdges, vEdge);

            if (vEdgeInList) {
                EdgeFactory._vEdges.push(vEdge);
            } else {
                console.log("Not included in vEdge List " + vEdgeInList);
            }
        } else {
            console.log("vEdge duplicated")
        }
    }

    static getLastEdge() {
        return EdgeFactory._edges.slice(-1)[0];
    }

    static getLastVEdge() {
        return EdgeFactory._vEdges.slice(-1)[0];
    }

    /** Returns the first element in the list equal to the one in the parameter, else returns false.  Equality determined by source-target pairs */
    static contains(list, edgeA) {
        let rtn = false;
        let element;
        if (list.length > 0) {
            element = list.filter(function(edgeB) {
                if (EdgeFactory.compareEdges(edgeA, edgeB)) return true;
            })[0];
        }
        if (element) rtn = element;
        return rtn;
    }

    /** Serves to evaluate if two edges are equal by comparing their source and target pajekIndexes.
     * @param edgeA : either Edge or VEdge
     * @param edgeB : either Edge or VEdge
     */
    static compareEdges(edgeA, edgeB, excludeKind) {
        let rtn = false;

        // compare pajek indexes
        if (edgeA && edgeB) {
            let A, B;
            if (edgeA.target) {
                A = [edgeA.source.idCat.pajekIndex, edgeA.target.idCat.pajekIndex];
            } else {
                A = [edgeA.source.idCat.pajekIndex, undefined];
            }
            if (edgeB.target) {
                B = [edgeB.source.idCat.pajekIndex, edgeB.target.idCat.pajekIndex];
            } else {
                B = [edgeB.source.idCat.pajekIndex, undefined];
            }
            rtn = (A[0] === B[0] && A[1] === B[1]);
        }
        // compare kinds for edges
        if (rtn == true && !excludeKind) {
            let A = edgeA;
            let B = edgeB;
            if (edgeA instanceof VEdge) {
                A = edgeA.edge;
            }
            if (edgeB instanceof VEdge) {
                B = edgeB.edge;
            }
            rtn = A.kind === B.kind;
        }
        return rtn;
    }


    static getBufferEdge() {
        return EdgeFactory._edgeBuffer;
    }

    static getBufferVEdge() {
        return EdgeFactory._vEdgeBuffer
    }

    static setBufferEdge(edge) {
        if (edge instanceof Edge) EdgeFactory._edgeBuffer = edge;
    }

    static setBufferVEdge(vEdge) {
        if (vEdge instanceof VEdge) EdgeFactory._vEdgeBuffer = vEdge;
    }

    static clearBuffer() {
        // reset variables
        EdgeFactory._edgeBuffer = undefined;
        EdgeFactory._vEdgeBuffer = undefined;
    }

    /** The logic here is this: the user operates on the vEdge. The moment she presses the Escape button or call this function
     * by any other mean, it is assumed that it is an user decision. So, the deletion trickels down from visual elements down
     * to logic elements. 
     */
    static recallBuffer() {
        if (EdgeFactory._vEdgeBuffer) {

            // get the VNode for the source
            let sourceVNode = EdgeFactory._vEdgeBuffer.source.vNodeObserver;

            // get the connectors for the source
            let sourceConnector = EdgeFactory._vEdgeBuffer.edge.getSourceConnector();

            // delete the edge here otherwise connector won't be empty for deletion */
            sourceVNode.node.disconnectEdge(EdgeFactory._vEdgeBuffer);

            // remove visual connectors from VNode
            sourceVNode.removeVConnector(sourceConnector);

            // remove connector from Node
            EdgeFactory._vEdgeBuffer.source.removeConnector(sourceConnector)

            if (EdgeFactory._vEdgeBuffer.target) {
                // the same process might need to be done with the target
            }
        }
    }


    /**This is not the function used by the exportModalFrom */
    static recordJSON(suffix) {
        let filename = "vEdges.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = [];
        for (let index = 0; index < EdgeFactory._vEdges.length; index++) {
            output.push(EdgeFactory._vEdges[index].getJSON());
        }
        gp5.saveJSON(output, filename);
    }

    static findEdge(sourcePajek, targetPajek, kind) {
        const tempSource = new Node(undefined, undefined, sourcePajek);
        const tempTarget = new Node(undefined, undefined, targetPajek);
        const tempEdge = new Edge(tempSource);
        tempEdge.kind = kind;
        tempEdge.setTarget(tempTarget);
        for (let edge of EdgeFactory._edges) {
            let found = EdgeFactory.compareEdges(tempEdge, edge, true);
            if (found) {
                console.log(edge);
            }
        }
    }

}
EdgeFactory._edgeBuffer;
EdgeFactory._vEdgeBuffer;
EdgeFactory._edges = [];
EdgeFactory._vEdges = [];