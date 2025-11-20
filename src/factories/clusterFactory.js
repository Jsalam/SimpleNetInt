"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterFactory = void 0;
var colorFactory_1 = require("./colorFactory");
var vCluster_1 = require("../visualElements/vCluster");
var cluster_1 = require("../graphElements/cluster");
var addClusterModalForm_1 = require("../GUI/forms/addClusterModalForm");
var transformerFactory_1 = require("./transformerFactory");
var node_1 = require("../graphElements/node");
var edgeFactory_1 = require("./edgeFactory");
var vGeoCluster_1 = require("../visualElements/vGeoCluster");
var canvas_1 = require("../canvas/canvas");
var main_1 = require("../main");
var ClusterSettings_1 = require("../GUI/widgets/ClusterSettings");
var vSelectionCluster_1 = require("../visualElements/vSelectionCluster");
var ClusterFactory = /** @class */ (function () {
    function ClusterFactory() {
    }
    ClusterFactory.makeClusters = function (data) {
        ClusterFactory.initParameters();
        ClusterFactory.clusters = [];
        this.vClusters = [];
        // global function from addClusterModalForm.js
        (0, addClusterModalForm_1.clearClusterModalFormList)();
        for (var index = 0; index < Object.keys(data).length; index++) {
            this.instantiateCluster(data[index]);
        }
        //** Visual cluster section
        var x = ClusterFactory.wdth + ClusterFactory.gutter;
        for (var index = 0; index < ClusterFactory.clusters.length; index++) {
            //  vCluster parameters
            var cluster = ClusterFactory.clusters[index];
            var posX = 25 + x * index;
            var posY = 20;
            var width = ClusterFactory.wdth;
            var height = ClusterFactory.hght;
            var palette = colorFactory_1.ColorFactory.getPalette(index);
            // vCluster instantiation
            var tmp = void 0;
            if (cluster.type === "geo") {
                tmp = new vGeoCluster_1.VGeoCluster(cluster, posX, posY, width, height, palette, data[index].bbox, data[index].mapName, data[index].secondaryMapName, data[index].palette); //  /files/Cartographies/Brazil_Amazon.geojson
            }
            else {
                tmp = new vCluster_1.VCluster(cluster, posX, posY, width, height, palette);
            }
            ClusterSettings_1.ClusterSettings.add(tmp);
            // set the VCluster transformer from data imported
            if (transformerFactory_1.TransFactory.getTransformerByVClusterID(ClusterFactory.clusters[index].id).initFromDataValues(data[index])) {
                // set the transformed values VCluster transformer from data imported
                for (var _i = 0, _a = tmp.vNodes; _i < _a.length; _i++) {
                    var vNode = _a[_i];
                    vNode.transformed = true;
                }
            }
            canvas_1.Canvas.subscribe(tmp);
            ClusterFactory.vClusters.push(tmp);
        }
    };
    /**
     * This function is used to create a new cluster in addition to the ones loaded from the imported json network
     * @param {Object} data cluster attributes. Usually entered with a form
     */
    ClusterFactory.makeCluster = function (data) {
        this.instantiateCluster(data);
        var x = ClusterFactory.wdth + ClusterFactory.gutter;
        var index = ClusterFactory.clusters.length - 1;
        var tmp;
        if (data.clusterType === "selection") {
            tmp = new vSelectionCluster_1.VSelectionCluster(ClusterFactory.clusters[index], 15 + x * index, 10, ClusterFactory.wdth, ClusterFactory.hght, colorFactory_1.ColorFactory.getPalette(index));
        }
        else {
            tmp = new vCluster_1.VCluster(ClusterFactory.clusters[index], 15 + x * index, 10, ClusterFactory.wdth, ClusterFactory.hght, colorFactory_1.ColorFactory.getPalette(index));
        }
        ClusterSettings_1.ClusterSettings.add(tmp);
        canvas_1.Canvas.subscribe(tmp);
        ClusterFactory.vClusters.push(tmp);
        return tmp;
    };
    /**
     * Layout parameters
     * @param {number} wdth node width
     * @param {number} hght node height. only used whith rectangular node shape
     * @param {number} gutter gap between columns of clusters
     */
    ClusterFactory.initParameters = function (wdth, hght, gutter) {
        if (wdth === void 0) { wdth = 10; }
        if (hght === void 0) { hght = 10; }
        if (gutter === void 0) { gutter = 150; }
        ClusterFactory.wdth = wdth;
        ClusterFactory.hght = hght;
        ClusterFactory.gutter = gutter;
    };
    ClusterFactory.instantiateCluster = function (data) {
        var cluster = new cluster_1.Cluster(data.clusterID, data.clusterType, data.timestamps, data.dimensions);
        cluster.setLabel(data.clusterLabel);
        cluster.setDescription(data.clusterDescription);
        this.makeNodes(cluster, data);
        ClusterFactory.clusters.push(cluster);
        // global function from addClusterModalForm.js
        (0, addClusterModalForm_1.addClusterToModalFormList)(data.clusterID, data.clusterLabel);
        //console.log("Cluster added. Total: " + ClusterFactory.clusters.length)
    };
    ClusterFactory.makeNodes = function (cluster, data) {
        if (data.nodes) {
            // create Nodes
            for (var index = 0; index < data.nodes.length; index++) {
                var node = this.makeNode(cluster, data.nodes[index]);
                cluster.addNode(node);
            }
        }
    };
    ClusterFactory.makeNode = function (cluster, data) {
        var node = new node_1.Node(cluster.id, data.id, this.countCat);
        node.setLabel(data.nodeLabel);
        node.setDescription(data.nodeDescription);
        node.setAttributes(data.nodeAttributes);
        node.setImportedVNodeData(data.vNode);
        ClusterFactory.countCat++;
        // create connectors if data comes with that info. Data usually comes from
        // the JSON file or the node created by user input
        if (data.connectors) {
            for (var _i = 0, _a = data.connectors; _i < _a.length; _i++) {
                var connector = _a[_i];
                node.addConnector(connector, node.connectors.length);
            }
        }
        return node;
    };
    ClusterFactory.deleteNode = function (vNode) {
        console.log("delete node " + JSON.stringify(vNode.node.idCat));
        for (var _i = 0, _a = vNode.vConnectors; _i < _a.length; _i++) {
            var vC = _a[_i];
            for (var _b = 0, _c = vC.connector.edgeObservers; _b < _c.length; _b++) {
                var edgeObs = _c[_b];
                // go over all its vConnectors and ask them to delete themselves. That should delete all the edges referencing them
                edgeFactory_1.EdgeFactory.deleteEdge(edgeObs);
            }
        }
        if (vNode.node.connectors.length == 0) {
            // get cluster
            var cluster = this.getCluster(vNode.node.idCat.cluster);
            var vCluster = this.getVCluster(vNode.node.idCat.cluster);
            // get node index
            var indexC = cluster.nodes.indexOf(vNode.node);
            var indexVC = vCluster.vNodes.indexOf(vNode);
            // delete node from array
            cluster.nodes.splice(indexC, 1);
            vCluster.vNodes.splice(indexVC, 1);
            // unsubscribe vNode
            canvas_1.Canvas.unsubscribe(vNode);
            console.log("Node and VNode deleted " + JSON.stringify(vNode.node.idCat));
        }
    };
    /**This is not the function used by the exportModalFrom. Look for the getJSON() function in VCluster class */
    ClusterFactory.recordJSON = function (suffix) {
        var filename = "nodes.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        var output = [];
        for (var index = 0; index < ClusterFactory.clusters.length; index++) {
            output.push(ClusterFactory.clusters[index].getJSON());
        }
        main_1.gp5.saveJSON(output, filename);
    };
    ClusterFactory.reset = function () {
        ClusterFactory.clusters = [];
        ClusterFactory.vClusters = [];
        ClusterFactory.countCat = 1;
    };
    ClusterFactory.getVClusterOf = function (cluster) {
        for (var _i = 0, _a = ClusterFactory.vClusters; _i < _a.length; _i++) {
            var vClust = _a[_i];
            if (vClust.cluster.id == cluster.id)
                return vClust;
        }
    };
    ClusterFactory.resetAllConnectors = function () {
        for (var _i = 0, _a = ClusterFactory.clusters; _i < _a.length; _i++) {
            var cluster = _a[_i];
            for (var _b = 0, _c = cluster.nodes; _b < _c.length; _b++) {
                var node = _c[_b];
                node.resetConnectors();
            }
        }
    };
    ClusterFactory.checkPropagation = function () {
        for (var _i = 0, _a = ClusterFactory.vClusters; _i < _a.length; _i++) {
            var vCluster = _a[_i];
            for (var _b = 0, _c = vCluster.vNodes; _b < _c.length; _b++) {
                var vNode = _c[_b];
                if (vNode.propagated) {
                    vNode.node.propagate(vNode.node, vNode.propagated);
                }
            }
        }
    };
    ClusterFactory.getVNodeOf = function (node) {
        var vCluster = ClusterFactory.getVCluster(node.idCat.cluster);
        return vCluster.getVNode(node);
    };
    ClusterFactory.getCluster = function (id) {
        var tmp = ClusterFactory.clusters.filter(function (elem) {
            return elem.id == id;
        })[0];
        return tmp;
    };
    ClusterFactory.getVCluster = function (id) {
        var tmp = ClusterFactory.vClusters.filter(function (elem) {
            return elem.cluster.id == id;
        })[0];
        return tmp;
    };
    ClusterFactory.getClusterByLabel = function (label) {
        var tmp = ClusterFactory.clusters.filter(function (elem) {
            return elem.label == label;
        })[0];
        return tmp;
    };
    ClusterFactory.getVClusterByLabel = function (label) {
        var tmp = ClusterFactory.vClusters.filter(function (elem) {
            return elem.cluster.label == label;
        })[0];
        return tmp;
    };
    /**
     * Retrieves all the KINDS of connectors in every cluster.
     * To get the actual connectors us the function getConnectors
     * of the class Cluster
     * @returns Array of strings
     */
    ClusterFactory.getAllConnectorKinds = function () {
        var rtn = [];
        for (var _i = 0, _a = ClusterFactory.clusters; _i < _a.length; _i++) {
            var clust = _a[_i];
            for (var _b = 0, _c = clust.nodes; _b < _c.length; _b++) {
                var node = _c[_b];
                var connectors = node.getConnectors();
                for (var i = 0; i < connectors.length; i++) {
                    var element = connectors[i];
                    if (!rtn.includes(element.kind))
                        rtn.push(element.kind);
                }
            }
        }
        return rtn;
    };
    ClusterFactory.showSelectedArea = function () {
        if (!this.selectionStart || !this.selectionEnd)
            return;
        main_1.gp5.push();
        main_1.gp5.stroke(255);
        main_1.gp5.strokeWeight(4);
        main_1.gp5.noFill();
        main_1.gp5.rect(Math.min(this.selectionEnd.x, this.selectionStart.x), Math.min(this.selectionEnd.y, this.selectionStart.y), Math.abs(this.selectionEnd.x - this.selectionStart.x), Math.abs(this.selectionEnd.y - this.selectionStart.y));
        main_1.gp5.pop();
    };
    ClusterFactory.createSelection = function () {
        if (!this.selectionStart || !this.selectionEnd)
            return;
        var minX = Math.min(this.selectionEnd.x, this.selectionStart.x);
        var minY = Math.min(this.selectionEnd.y, this.selectionStart.y);
        var maxX = Math.max(this.selectionEnd.x, this.selectionStart.x);
        var maxY = Math.max(this.selectionEnd.y, this.selectionStart.y);
        var selectedVNodes = [];
        this.vClusters.forEach(function (cluster) {
            cluster.vNodes.forEach(function (vNode) {
                if (vNode.pos &&
                    vNode.pos.x >= minX &&
                    vNode.pos.x <= maxX &&
                    vNode.pos.y >= minY &&
                    vNode.pos.y <= maxY) {
                    selectedVNodes.push(vNode);
                }
            });
        });
        if (selectedVNodes.length > 0) {
            var selectionVCluster_1 = this.makeCluster({
                clusterType: "selection",
                clusterDescription: "Cluster description",
                clusterID: "selection-" + this.nextSelectionId,
                clusterLabel: "Selection " + this.nextSelectionId,
                nodes: [],
            });
            this.nextSelectionId++;
            selectionVCluster_1.boundingBox = [minX, minY, maxX - minX, maxY - minY];
            selectionVCluster_1.vNodes = selectedVNodes;
            selectionVCluster_1.cluster.nodes = selectedVNodes.map(function (vNode) { return vNode.node; });
            selectedVNodes.forEach(function (vNode) {
                vNode.parentVCluster = selectionVCluster_1;
            });
        }
        this.selectionStart = this.selectionEnd = null;
    };
    ClusterFactory.countCat = 1;
    ClusterFactory.wdth = 10;
    ClusterFactory.hght = 10;
    // The distance between vClusters origin
    ClusterFactory.gutter = 150;
    ClusterFactory.selectionStart = null;
    ClusterFactory.selectionEnd = null;
    ClusterFactory.nextSelectionId = 0;
    return ClusterFactory;
}());
exports.ClusterFactory = ClusterFactory;
// Attach ClusterFactory to the global window object
window.ClusterFactory = ClusterFactory;
