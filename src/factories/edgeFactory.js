"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeFactory = void 0;
var edge_1 = require("../graphElements/edge");
var main_1 = require("../main");
var vEdge_1 = require("../visualElements/vEdge");
var clusterFactory_1 = require("./clusterFactory");
var canvas_1 = require("../canvas/canvas");
var EdgeFactory = /** @class */ (function () {
    function EdgeFactory() {
    }
    EdgeFactory.buildEdges = function (edgs, clusters) {
        var _loop_1 = function (index) {
            // take the source ID: cluster, cat and polarity
            var e = edgs[index];
            var source = void 0;
            var sourceConnector = void 0;
            // get source node
            try {
                var cluster = clusterFactory_1.ClusterFactory.getCluster(e.source.cluster);
                source = cluster.getNode(e.source.index);
                sourceConnector = source.connectors.filter(function (cnctr) { return cnctr.kind == e.kind; })[0];
                // In case the node does not have the connector. Usual case in merged networks.
                if (!sourceConnector) {
                    sourceConnector = source.addConnector(e.kind, source.connectors.length);
                    source.vNodeObserver.addVConnector(sourceConnector);
                }
            }
            catch (error) {
                console.log(error);
                alert("Cannot retrieve the source of this edge:\n" + JSON.stringify(e));
            }
            // get target node
            var target = void 0;
            var targetConnector = void 0;
            try {
                var cluster = clusterFactory_1.ClusterFactory.getCluster(e.target.cluster);
                target = cluster.getNode(e.target.index);
                targetConnector = target.connectors.filter(function (cnctr) { return cnctr.kind == e.kind; })[0];
                // In case the node does not have the connector. Usual case in merged networks.
                if (!targetConnector) {
                    targetConnector = target.addConnector(e.kind, target.connectors.length);
                    target.vNodeObserver.addVConnector(targetConnector);
                }
            }
            catch (error) {
                console.log(error);
                alert("Cannot retrieve the target of this edge:\n" + JSON.stringify(e));
            }
            // Instantiate the edge and the vEdge
            try {
                // get vSource
                var vSource = clusterFactory_1.ClusterFactory.getVNodeOf(source);
                // get vTarget
                var vTarget = clusterFactory_1.ClusterFactory.getVNodeOf(target);
                // make Edge and set target and weight
                var edge = new edge_1.Edge(source);
                edge.setTarget(target);
                edge.weight = e.weight;
                // subscribe to source and target's connector. This sets the edge kind
                // console.log(e);
                // console.log(source);
                // console.log(target);
                sourceConnector.subscribeEdgeObserver(edge);
                targetConnector.subscribeEdgeObserver(edge);
                // make VEdge
                var vEdge = new vEdge_1.VEdge(edge);
                // set VNodes
                vEdge.setVSource(vSource);
                vEdge.setVTarget(vTarget);
                // Push Edge
                EdgeFactory.pushEdge(edge);
                EdgeFactory.pushVEdge(vEdge);
                canvas_1.Canvas.subscribe(vEdge);
            }
            catch (error) {
                console.log(error);
                //  alert("Cannot complete the instantiation of this edge:\n" + JSON.stringify(e))
            }
        };
        for (var index = 0; index < Object.keys(edgs).length; index++) {
            _loop_1(index);
        }
    };
    // static get EDGES() {
    //     return EdgeFactory._edges;
    // }
    EdgeFactory.reset = function () {
        EdgeFactory._edges = [];
        EdgeFactory._vEdges = [];
    };
    EdgeFactory.deleteLastVEdge = function () {
        // remove the last vEdge from the collection
        var lastVEdge = EdgeFactory._vEdges.pop();
        // delete corresponding edge
        EdgeFactory._edges.pop();
        if (lastVEdge) {
            // remove connectors from its vNodes
            lastVEdge.vSource.popVConnector(lastVEdge.edge.kind);
            lastVEdge.vTarget.popVConnector(lastVEdge.edge.kind);
            // unsubscribe vEdge from canvas
            canvas_1.Canvas.unsubscribe(lastVEdge);
        }
    };
    EdgeFactory.deleteEdge = function (edge) {
        // find the corresponding vEdge
        var tmpEdge = EdgeFactory.contains(EdgeFactory._edges, edge);
        var tmpVEdge = EdgeFactory.retrieveVEdgeForEdge(tmpEdge);
        var indexOf = EdgeFactory._vEdges.indexOf(tmpVEdge);
        // extract the VEdge from the collections
        var removedVEdge = EdgeFactory._vEdges.splice(indexOf, 1)[0];
        // delete corresponding edge
        indexOf = EdgeFactory._edges.indexOf(edge);
        var removedEdge = EdgeFactory._edges.splice(indexOf, 1)[0];
        removedEdge = undefined;
        // remove connectors from its vNodes
        if (removedVEdge) {
            // eliminate unliked connectors
            removedVEdge.vSource.destroyVConnector(removedVEdge.edge);
            removedVEdge.vTarget.destroyVConnector(removedVEdge.edge);
            // unsubscribe vEdge from canvas
            canvas_1.Canvas.unsubscribe(removedVEdge);
            //     console.log("done")
        }
    };
    EdgeFactory.retrieveVEdgeForEdge = function (edgeA) {
        var rtn = false;
        var element;
        if (EdgeFactory._vEdges.length > 0) {
            element = EdgeFactory._vEdges.filter(function (vEdgeB) {
                var edgeB = vEdgeB.edge;
                if (EdgeFactory.compareEdges(edgeA, edgeB))
                    return true;
            })[0];
        }
        if (element)
            rtn = element;
        // NOTE: does this mean that the element retrieved from the list of vEdges is not a VEdge? Or does it mean that
        // the element could be a boolean (false)? Please advise.
        return rtn;
    };
    EdgeFactory.isThereOpenEdge = function () {
        var rtn = false;
        if (EdgeFactory._vEdgeBuffer) {
            rtn = true;
        }
        return rtn;
    };
    EdgeFactory.pushEdge = function (edge) {
        if (edge instanceof edge_1.Edge) {
            var edgeInList = EdgeFactory.contains(EdgeFactory._edges, edge);
            if (edgeInList) {
                console.log("Duplicated edge. Weight increased by 1");
                edgeInList.increaseWeight();
            }
            else {
                EdgeFactory._edges.push(edge);
            }
        }
    };
    EdgeFactory.pushVEdge = function (vEdge) {
        if (vEdge instanceof vEdge_1.VEdge) {
            var vEdgeInList = !EdgeFactory.contains(EdgeFactory._vEdges, vEdge);
            if (vEdgeInList) {
                EdgeFactory._vEdges.push(vEdge);
            }
            else {
                console.log("Not included in vEdge List " + vEdgeInList);
            }
        }
        else {
            console.log("vEdge duplicated");
        }
    };
    EdgeFactory.getLastEdge = function () {
        return EdgeFactory._edges.slice(-1)[0];
    };
    EdgeFactory.getLastVEdge = function () {
        return EdgeFactory._vEdges.slice(-1)[0];
    };
    /** Returns the first element in the list equal to the one in the parameter, else returns false.  Equality determined by source-target pairs */
    EdgeFactory.contains = function (list, edgeA) {
        var rtn = false;
        var element;
        if (list.length > 0) {
            element = list.filter(function (edgeB) {
                if (EdgeFactory.compareEdges(edgeA, edgeB))
                    return true;
            })[0];
        }
        if (element)
            rtn = element;
        return rtn;
    };
    /** Serves to evaluate if two edges are equal by comparing their source and target pajekIndexes.
     * @param edgeA : either Edge or VEdge
     * @param edgeB : either Edge or VEdge
     */
    EdgeFactory.compareEdges = function (edgeA, edgeB) {
        var rtn = false;
        // compare pajek indexes
        if (edgeA && edgeB) {
            var A = void 0, B = void 0;
            if (edgeA.target) {
                A = [edgeA.source.idCat.pajekIndex, edgeA.target.idCat.pajekIndex];
            }
            else {
                A = [edgeA.source.idCat.pajekIndex, undefined];
            }
            if (edgeB.target) {
                B = [edgeB.source.idCat.pajekIndex, edgeB.target.idCat.pajekIndex];
            }
            else {
                B = [edgeB.source.idCat.pajekIndex, undefined];
            }
            rtn = A[0] === B[0] && A[1] === B[1];
        }
        // compare kinds for edges
        if (rtn == true) {
            var A = edgeA;
            var B = edgeB;
            if (edgeA instanceof vEdge_1.VEdge) {
                A = edgeA.edge;
            }
            if (edgeB instanceof vEdge_1.VEdge) {
                B = edgeB.edge;
            }
            rtn = A.kind === B.kind;
        }
        return rtn;
    };
    EdgeFactory.getBufferEdge = function () {
        return EdgeFactory._edgeBuffer;
    };
    EdgeFactory.getBufferVEdge = function () {
        return EdgeFactory._vEdgeBuffer;
    };
    EdgeFactory.setBufferEdge = function (edge) {
        EdgeFactory._edgeBuffer = edge;
    };
    EdgeFactory.setBufferVEdge = function (vEdge) {
        EdgeFactory._vEdgeBuffer = vEdge;
    };
    EdgeFactory.clearBuffer = function () {
        // reset variables
        EdgeFactory._edgeBuffer = undefined;
        EdgeFactory._vEdgeBuffer = undefined;
    };
    /** The logic here is this: the user operates on the vEdge. The moment she presses the Escape button or call this function
     * by any other mean, it is assumed that it is an user decision. So, the deletion trickels down from visual elements down
     * to logic elements.
     */
    EdgeFactory.recallBuffer = function () {
        if (EdgeFactory._vEdgeBuffer) {
            // get the VNode for the source
            var sourceVNode = EdgeFactory._vEdgeBuffer.source.vNodeObserver;
            // get the connectors for the source
            var sourceConnector = EdgeFactory._vEdgeBuffer.edge.getSourceConnector();
            // delete the edge here otherwise connector won't be empty for deletion */
            sourceVNode.node.disconnectEdge(EdgeFactory._vEdgeBuffer.edge);
            // remove visual connectors from VNode
            sourceVNode.removeVConnector(sourceConnector);
            // remove connector from Node
            EdgeFactory._vEdgeBuffer.source.removeConnector(sourceConnector);
            if (EdgeFactory._vEdgeBuffer.target) {
                // the same process might need to be done with the target
            }
        }
    };
    /**This is not the function used by the exportModalFrom. Look for the getJSON() function in VEdge class */
    EdgeFactory.recordJSON = function (suffix) {
        var filename = "vEdges.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        var output = [];
        for (var index = 0; index < EdgeFactory._vEdges.length; index++) {
            output.push(EdgeFactory._vEdges[index].getJSON());
        }
        main_1.gp5.saveJSON(output, filename);
    };
    EdgeFactory._edges = [];
    EdgeFactory._vEdges = [];
    return EdgeFactory;
}());
exports.EdgeFactory = EdgeFactory;
