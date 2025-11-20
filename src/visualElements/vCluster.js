"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VCluster = void 0;
var vNode_1 = require("./vNode");
var layout_1 = require("./layouts/layout");
var transformerFactory_1 = require("../factories/transformerFactory");
var button_1 = require("./button");
var main_1 = require("../main");
var colorFactory_1 = require("../factories/colorFactory");
var canvas_1 = require("../canvas/canvas");
var node_1 = require("../graphElements/node");
var VCluster = /** @class */ (function (_super) {
    __extends(VCluster, _super);
    function VCluster(cluster, x, y, width, height, palette) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.sortingWidget = null;
        _this.boundingBox = [0, 0, 0, 0];
        _this.vNodes = [];
        _this.cluster = cluster;
        _this.palette = palette;
        // instantiate a layout
        _this.layout = new layout_1.Layout();
        _this.populateVNodes(cluster);
        _this.layout.subscribeVNodes(_this.vNodes);
        // instantiate a tranformer for this vCluster
        transformerFactory_1.TransFactory.initTransformer(_this);
        return _this;
    }
    // Observing to Canvas
    VCluster.prototype.fromCanvas = function (data) {
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
    };
    VCluster.prototype.populateVNodes = function (cluster) {
        for (var index = 0; index < cluster.nodes.length; index++) {
            var node = cluster.nodes[index];
            // Create vNode
            var vNodeTemp = void 0;
            if (node instanceof node_1.Node) {
                // node size
                var vNodeW = 10;
                var vNodeH = 10;
                // instantiation
                vNodeTemp = new vNode_1.VNode(node, vNodeW, vNodeH, this);
                for (var _i = 0, _a = vNodeTemp.node.connectors; _i < _a.length; _i++) {
                    var connector = _a[_i];
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
    };
    VCluster.prototype.addVNode = function (vNode, data) {
        if (data) {
            var pos = main_1.gp5.createVector(data.posX, data.posY, data.posZ);
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
    };
    VCluster.prototype.getVNode = function (node) {
        return this.vNodes.filter(function (vN) {
            return vN.node.idCat === node.idCat;
        })[0];
    };
    VCluster.prototype.setPalette = function (palette) {
        if (palette) {
            this.palette = palette;
        }
        var counter = 0;
        if (this.palette) {
            for (var i = 0; i < this.vNodes.length; i++) {
                if (counter >= this.palette.length) {
                    counter = 0;
                }
                this.vNodes[i].setColor(this.palette[counter]);
                counter++;
            }
        }
    };
    VCluster.prototype.highlight = function (vNode) { };
    VCluster.prototype.show = function (renderer) {
        renderer.textAlign(main_1.gp5.LEFT, main_1.gp5.TOP);
        if (this.cluster.label) {
            renderer.textSize(12);
            renderer.fill(100);
            renderer.noStroke();
            renderer.textLeading(12);
            renderer.text(this.cluster.label, this.pos.x, this.pos.y, 140);
        }
    };
    VCluster.prototype.updatePalette = function () { };
    VCluster.prototype.getJSON = function () {
        var trans = transformerFactory_1.TransFactory.getTransformerByVClusterID(this.cluster.id);
        var rtn = {
            clusterID: this.cluster.id,
            clusterLabel: this.cluster.label,
            clusterDescription: this.cluster.description,
            // The latest values of the transformer linked to this vCluster
            scaleFactor: trans.scaleFactor,
            matrixComponents: JSON.stringify(trans.transform),
            nodes: [],
        };
        this.vNodes.forEach(function (vNode) {
            var tmpN = vNode.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    };
    return VCluster;
}(button_1.Button));
exports.VCluster = VCluster;
