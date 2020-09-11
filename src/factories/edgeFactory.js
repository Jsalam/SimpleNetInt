class EdgeFactory {

    static buildEdges(edgs, clusters) {

        for (let index = 0; index < Object.keys(edgs).length; index++) {

            // take the source ID: cluster, cat and polarity
            let e = edgs[index];

            // get source node
            let clusterIndex = e.source.cluster - 1;
            let nodeIndex = e.source.index;
            let source = ClusterFactory.clusters[clusterIndex].nodes[nodeIndex];
            let sourceConnector = source.connectors.filter(cnctr => cnctr.kind == e.kind)[0];

            // get target node
            clusterIndex = e.target.cluster - 1;
            nodeIndex = e.target.index;
            let target = ClusterFactory.clusters[clusterIndex].nodes[nodeIndex];
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

    // static get EDGES() {
    //     return EdgeFactory._edges;
    // }

    static reset() {
        EdgeFactory._edges = [];
        EdgeFactory._vEdges = [];
    }

    static deleteLastEdge() {
        let lastEdge = EdgeFactory._edges.pop();
        lastEdge.source.popThisConnector();
        lastEdge.target.popThisConnector();
        EdgeFactory._vEdges.pop();
        console.log(" Edge deleted linking category: " +
            lastEdge.source.nodeObserver.label + ", in cluster: " +
            lastEdge.id.source.cluster + " with category: " +
            lastEdge.target.nodeObserver.label + ", in cluster: " +
            lastEdge.id.target.cluster);
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
            let vEdgeInList = !EdgeFactory.contains(EdgeFactory._vEdges, vEdge)
            if (vEdgeInList) {
                EdgeFactory._vEdges.push(vEdge);
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
    static compareEdges(edgeA, edgeB) {
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
            return (A[0] === B[0] && A[1] === B[1]);
        } else {
            return undefined;
        }
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
}
EdgeFactory._edgeBuffer;
EdgeFactory._vEdgeBuffer;
EdgeFactory._edges = [];
EdgeFactory._vEdges = [];