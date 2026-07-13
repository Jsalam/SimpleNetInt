"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterFactory = void 0;
const colorFactory_1 = require("./colorFactory");
const vCluster_1 = require("../visualElements/vCluster");
const cluster_1 = require("../graphElements/cluster");
const addClusterModalForm_1 = require("../GUI/forms/addClusterModalForm");
const transformerFactory_1 = require("./transformerFactory");
const node_1 = require("../graphElements/node");
const edgeFactory_1 = require("./edgeFactory");
const vGeoCluster_1 = require("../visualElements/vGeoCluster");
const canvas_1 = require("../canvas/canvas");
const main_1 = require("../main");
const settingsPanelFactory_1 = require("./settingsPanelFactory");
const vSelectionCluster_1 = require("../visualElements/vSelectionCluster");
/**
 * @class ClusterFactory
 * @description This class is responsible for creating and managing clusters and their visual representations (vClusters) in the application.
 * It provides methods to initialize clusters from data, create new clusters, manage layout parameters, and handle node deletion.
 */
class ClusterFactory {
    static clusters;
    static vClusters;
    static countCat = 1;
    static wdth = 30;
    static hght = 30;
    // The distance between vClusters origin
    static gutter = 150;
    static selectionStart = null;
    static selectionEnd = null;
    static nextSelectionId = 0;
    static makeClusters(data) {
        ClusterFactory.initParameters();
        ClusterFactory.clusters = [];
        this.vClusters = [];
        // global function from addClusterModalForm.js
        (0, addClusterModalForm_1.clearClusterModalFormList)();
        for (let index = 0; index < Object.keys(data).length; index++) {
            this.instantiateCluster(data[index]);
            let paletteTmp = data[index].palette;
            if (paletteTmp) {
                // get the palette keys
                let keys = Object.keys(paletteTmp);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    colorFactory_1.ColorFactory.addSequentialPalette(key, paletteTmp[key]);
                }
            }
        }
        // 
        //   if (data[index].palette) 
        //** Visual cluster section
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            //  vCluster parameters
            let cluster = ClusterFactory.clusters[index];
            let posX = 270 + x * index;
            let posY = 20;
            let width = ClusterFactory.wdth;
            let height = ClusterFactory.hght;
            let palette = colorFactory_1.ColorFactory.getCategoricalPalette('palette' + (index + 1));
            // vCluster instantiation
            let tmp;
            if (cluster.type === "geo") {
                tmp = new vGeoCluster_1.VGeoCluster(cluster, posX, posY, width, height, palette, data[index].bbox, data[index].mapName, data[index].secondaryMapName, data[index].palette); //  /files/Cartographies/Brazil_Amazon.geojson
            }
            else {
                tmp = new vCluster_1.VCluster(cluster, posX, posY, width, height, palette);
            }
            // Builds the cluster settings menu on the left side of the screen
            settingsPanelFactory_1.SettingsPanelFactory.add(tmp, true);
            // set the VCluster transformer from data imported
            if (transformerFactory_1.TransFactory.getTransformerByVClusterID(ClusterFactory.clusters[index].id).initFromDataValues(data[index])) {
                // set the transformed values VCluster transformer from data imported
                for (const vNode of tmp.vNodes) {
                    vNode.transformed = true;
                }
            }
            canvas_1.Canvas.subscribe(tmp);
            ClusterFactory.vClusters.push(tmp);
        }
    }
    /**
     * This function is used to create a new cluster in addition to the ones loaded from the imported json network
     * @param {Object} data cluster attributes. Usually entered with a form
     */
    static makeCluster(data) {
        this.instantiateCluster(data);
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        let index = ClusterFactory.clusters.length - 1;
        let tmp;
        if (data.clusterType === "selection") {
            tmp = new vSelectionCluster_1.VSelectionCluster(ClusterFactory.clusters[index], 15 + x * index, 10, ClusterFactory.wdth, ClusterFactory.hght, colorFactory_1.ColorFactory.getCategoricalPalette('palette' + (index + 1)));
        }
        else {
            tmp = new vCluster_1.VCluster(ClusterFactory.clusters[index], 270 + x * index, 10, ClusterFactory.wdth, ClusterFactory.hght, colorFactory_1.ColorFactory.getCategoricalPalette('palette' + (index + 1)));
        }
        settingsPanelFactory_1.SettingsPanelFactory.add(tmp, true, document.getElementById('cSettingsMain'));
        canvas_1.Canvas.subscribe(tmp);
        ClusterFactory.vClusters.push(tmp);
        return tmp;
    }
    /**
     * Layout parameters
     * @param {number} wdth node width
     * @param {number} hght node height. only used whith rectangular node shape
     * @param {number} gutter gap between columns of clusters
     */
    static initParameters(wdth = 10, hght = 10, gutter = 150) {
        ClusterFactory.wdth = wdth;
        ClusterFactory.hght = hght;
        ClusterFactory.gutter = gutter;
    }
    static instantiateCluster(data) {
        let cluster = new cluster_1.Cluster(data.clusterID, data.clusterType, data.timestamps, data.dimensions, data.lookupTable);
        cluster.setLabel(data.clusterLabel);
        cluster.setDescription(data.clusterDescription);
        this.makeNodes(cluster, data);
        ClusterFactory.clusters.push(cluster);
        // global function from addClusterModalForm.js
        (0, addClusterModalForm_1.addClusterToModalFormList)(data.clusterID, data.clusterLabel);
        //console.log("Cluster added. Total: " + ClusterFactory.clusters.length)
    }
    static makeNodes(cluster, data) {
        if (data.nodes) {
            // create Nodes
            for (let index = 0; index < data.nodes.length; index++) {
                let node = this.makeNode(cluster, data.nodes[index]);
                cluster.addNode(node);
            }
        }
    }
    static makeNode(cluster, data) {
        let node = new node_1.Node(cluster.id, data.id, this.countCat);
        node.setLabel(data.nodeLabel);
        node.setDescription(data.nodeDescription);
        node.setAttributes(data.nodeAttributes);
        node.setImportedVNodeData(data.vNode);
        ClusterFactory.countCat++;
        // create connectors if data comes with that info. Data usually comes from
        // the JSON file or the node created by user input
        if (data.connectors) {
            for (const connector of data.connectors) {
                node.addConnector(connector, node.connectors.length);
            }
        }
        return node;
    }
    static deleteNode(vNode) {
        console.log("delete node " + JSON.stringify(vNode.node.idCat));
        for (let vC of vNode.vConnectors) {
            for (let edgeObs of vC.connector.edgeObservers) {
                // go over all its vConnectors and ask them to delete themselves. That should delete all the edges referencing them
                edgeFactory_1.EdgeFactory.deleteEdge(edgeObs);
            }
        }
        if (vNode.node.connectors.length == 0) {
            // get cluster
            let cluster = this.getCluster(vNode.node.idCat.cluster);
            let vCluster = this.getVCluster(vNode.node.idCat.cluster);
            // get node index
            const indexC = cluster.nodes.indexOf(vNode.node);
            const indexVC = vCluster.vNodes.indexOf(vNode);
            // delete node from array
            cluster.nodes.splice(indexC, 1);
            vCluster.vNodes.splice(indexVC, 1);
            // unsubscribe vNode
            canvas_1.Canvas.unsubscribe(vNode);
            console.log("Node and VNode deleted " + JSON.stringify(vNode.node.idCat));
        }
    }
    /**This is not the function used by the exportModalFrom. Look for the getJSON() function in VCluster class */
    static recordJSON(suffix) {
        let filename = "nodes.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = [];
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            output.push(ClusterFactory.clusters[index].getJSON());
        }
        main_1.gp5.saveJSON(output, filename);
    }
    static reset() {
        ClusterFactory.clusters = [];
        ClusterFactory.vClusters = [];
        ClusterFactory.countCat = 1;
    }
    static getVClusterOf(cluster) {
        for (const vClust of ClusterFactory.vClusters) {
            if (vClust.cluster.id == cluster.id)
                return vClust;
        }
    }
    static resetAllConnectors() {
        for (const cluster of ClusterFactory.clusters) {
            for (const node of cluster.nodes) {
                node.resetConnectors();
            }
        }
    }
    static checkPropagation() {
        for (const vCluster of ClusterFactory.vClusters) {
            for (const vNode of vCluster.vNodes) {
                if (vNode.propagated) {
                    vNode.node.propagate(vNode.node, vNode.propagated);
                }
            }
        }
    }
    static getVNodeOf(node) {
        let vCluster = ClusterFactory.getVCluster(node.idCat.cluster);
        return vCluster.getVNode(node);
    }
    static getCluster(id) {
        const tmp = ClusterFactory.clusters.filter((elem) => {
            return elem.id == id;
        })[0];
        return tmp;
    }
    static getVCluster(id) {
        const tmp = ClusterFactory.vClusters.filter((elem) => {
            return elem.cluster.id == id;
        })[0];
        return tmp;
    }
    static getClusterByLabel(label) {
        const tmp = ClusterFactory.clusters.filter((elem) => {
            return elem.label == label;
        })[0];
        return tmp;
    }
    static getVClusterByLabel(label) {
        const tmp = ClusterFactory.vClusters.filter((elem) => {
            return elem.cluster.label == label;
        })[0];
        return tmp;
    }
    /**
     * Retrieves all the KINDS of connectors in every cluster.
     * To get the actual connectors us the function getConnectors
     * of the class Cluster
     * @returns Array of strings
     */
    static getAllConnectorKinds() {
        let rtn = [];
        for (const clust of ClusterFactory.clusters) {
            for (const node of clust.nodes) {
                const connectors = node.getConnectors();
                for (let i = 0; i < connectors.length; i++) {
                    const element = connectors[i];
                    if (!rtn.includes(element.kind))
                        rtn.push(element.kind);
                }
            }
        }
        return rtn;
    }
    static showSelectedArea() {
        if (!this.selectionStart || !this.selectionEnd)
            return;
        main_1.gp5.push();
        main_1.gp5.stroke(255);
        main_1.gp5.strokeWeight(4);
        main_1.gp5.noFill();
        main_1.gp5.rect(Math.min(this.selectionEnd.x, this.selectionStart.x), Math.min(this.selectionEnd.y, this.selectionStart.y), Math.abs(this.selectionEnd.x - this.selectionStart.x), Math.abs(this.selectionEnd.y - this.selectionStart.y));
        main_1.gp5.pop();
    }
    static createSelection() {
        if (!this.selectionStart || !this.selectionEnd)
            return;
        const minX = Math.min(this.selectionEnd.x, this.selectionStart.x);
        const minY = Math.min(this.selectionEnd.y, this.selectionStart.y);
        const maxX = Math.max(this.selectionEnd.x, this.selectionStart.x);
        const maxY = Math.max(this.selectionEnd.y, this.selectionStart.y);
        const selectedVNodes = [];
        this.vClusters.forEach((cluster) => {
            cluster.vNodes.forEach((vNode) => {
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
            const selectionVCluster = this.makeCluster({
                clusterType: "selection",
                clusterDescription: "Cluster description",
                clusterID: "selection-" + this.nextSelectionId,
                clusterLabel: "Selection " + this.nextSelectionId,
                nodes: [],
            });
            this.nextSelectionId++;
            selectionVCluster.boundingBox = [minX, minY, maxX - minX, maxY - minY];
            selectionVCluster.vNodes = selectedVNodes;
            selectionVCluster.cluster.nodes = selectedVNodes.map((vNode) => vNode.node);
            selectedVNodes.forEach((vNode) => {
                vNode.parentVCluster = selectionVCluster;
            });
        }
        this.selectionStart = this.selectionEnd = null;
    }
}
exports.ClusterFactory = ClusterFactory;
// Attach ClusterFactory to the global window object
window.ClusterFactory = ClusterFactory;
//# sourceMappingURL=clusterFactory.js.map