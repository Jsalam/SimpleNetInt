"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VCluster = void 0;
const vNode_1 = require("./vNode");
const layout_1 = require("./layouts/layout");
const transformerFactory_1 = require("../factories/transformerFactory");
const button_1 = require("./button");
const main_1 = require("../main");
const colorFactory_1 = require("../factories/colorFactory");
const canvas_1 = require("../canvas/canvas");
const node_1 = require("../graphElements/node");
class VCluster extends button_1.Button {
    sortingWidget = null;
    vNodes;
    cluster;
    palette;
    layout;
    timestamp;
    dimension;
    boundingBox = [0, 0, 0, 0];
    constructor(cluster, x, y, width, height, palette) {
        super(x, y, width, height);
        this.vNodes = [];
        this.cluster = cluster;
        this.palette = palette;
        // instantiate a layout
        this.layout = new layout_1.Layout();
        this.populateVNodes(cluster);
        this.layout.subscribeVNodes(this.vNodes);
        // instantiate a tranformer for this vCluster
        transformerFactory_1.TransFactory.initTransformer(this);
    }
    // Observing to Canvas
    fromCanvas(data) {
        if (data.event instanceof MouseEvent) {
            // do something
        }
        else if (data.event instanceof KeyboardEvent) {
            // do something
        }
        else {
            // do something
        }
        return false;
    }
    populateVNodes(cluster) {
        for (let index = 0; index < cluster.nodes.length; index++) {
            const node = cluster.nodes[index];
            // Create vNode
            let vNodeTemp;
            if (node instanceof node_1.Node) {
                // node size
                let vNodeW = 10;
                let vNodeH = 10;
                // instantiation
                vNodeTemp = new vNode_1.VNode(node, vNodeW, vNodeH, this);
                for (const connector of vNodeTemp.node.connectors) {
                    vNodeTemp.addVConnector(connector);
                }
            }
            // set color if the data from JSON does not have color info
            if (!node.importedVNodeData.color) {
                if (!this.palette) {
                    vNodeTemp.setColor("#adadad");
                }
                else if (this.palette.length < 1) {
                    vNodeTemp.setColor(colorFactory_1.ColorFactory.getColor(this.palette, 0));
                }
                else {
                    vNodeTemp.setColor(colorFactory_1.ColorFactory.getColor(this.palette, index));
                }
            }
            // add to colecction
            this.addVNode(vNodeTemp, node.importedVNodeData);
        }
    }
    addVNode(vNode, data) {
        if (data) {
            const pos = main_1.gp5.createVector(data.posX, data.posY, data.posZ);
            vNode.updateCoords(pos, 0);
            vNode.setColor(data.color);
        }
        else {
            vNode.updateCoords(this.pos, this.vNodes.length + 1);
            vNode.setColor(colorFactory_1.ColorFactory.getColor(this.palette, this.cluster.nodes.length));
        }
        // subscribe to canvas
        canvas_1.Canvas.subscribe(vNode);
        // add to collection
        this.vNodes.push(vNode);
    }
    getVNode(node) {
        return this.vNodes.filter((vN) => {
            return vN.node.idCat === node.idCat;
        })[0];
    }
    setPalette(palette) {
        if (palette) {
            this.palette = palette;
        }
        let counter = 0;
        if (this.palette) {
            for (let i = 0; i < this.vNodes.length; i++) {
                if (counter >= this.palette.length) {
                    counter = 0;
                }
                this.vNodes[i].setColor(this.palette[counter]);
                counter++;
            }
        }
    }
    highlight(vNode) { }
    show(renderer) {
        renderer.textAlign(main_1.gp5.LEFT, main_1.gp5.TOP);
        if (this.cluster.label) {
            renderer.textSize(12);
            renderer.fill(100);
            renderer.noStroke();
            renderer.textLeading(12);
            renderer.text(this.cluster.label, this.pos.x, this.pos.y, 140);
        }
    }
    updatePalette() { }
    getJSON() {
        let trans = transformerFactory_1.TransFactory.getTransformerByVClusterID(this.cluster.id);
        let rtn = {
            clusterID: this.cluster.id,
            clusterLabel: this.cluster.label,
            clusterDescription: this.cluster.description,
            // The latest values of the transformer linked to this vCluster
            scaleFactor: trans.scaleFactor,
            matrixComponents: JSON.stringify(trans.transform),
            nodes: [],
        };
        this.vNodes.forEach((vNode) => {
            let tmpN = vNode.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    }
}
exports.VCluster = VCluster;
//# sourceMappingURL=vCluster.js.map