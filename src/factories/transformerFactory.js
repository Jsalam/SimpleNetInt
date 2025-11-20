"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransFactory = void 0;
var transformer_1 = require("../canvas/transformer");
var clusterFactory_1 = require("./clusterFactory");
var canvas_1 = require("../canvas/canvas");
/**
 * This class manages all the transformation matrices used in the visualization, except for the native matrices used by p5.js
 * The matrices are usually associated to vClusters
 */
var TransFactory = /** @class */ (function () {
    function TransFactory() {
    }
    TransFactory.init = function () {
        // clean elements
        TransFactory.transformers = [];
        for (var _i = 0, _a = clusterFactory_1.ClusterFactory.vClusters; _i < _a.length; _i++) {
            var vC = _a[_i];
            console.log(vC);
            TransFactory.initTransformer(vC);
        }
    };
    TransFactory.initTransformer = function (vC) {
        var temp = new transformer_1.Transformer(vC);
        // disable transformations
        temp.active = false;
        // add to collection
        TransFactory.transformers.push(temp);
        // transformers listens to Cnavas events
        canvas_1.Canvas.subscribe(temp);
    };
    TransFactory.zoom = function (amnt) {
        for (var _i = 0, _a = TransFactory.transformers; _i < _a.length; _i++) {
            var tr = _a[_i];
            tr.zoom(amnt);
        }
    };
    TransFactory.crissCross = function (amnt) {
        for (var index = 0; index < TransFactory.transformers.length; index++) {
            var transformer = TransFactory.transformers[index];
            if (index % 2 == 0) {
                transformer.zoom(amnt);
            }
            else {
                transformer.zoom(1 / amnt);
            }
        }
    };
    TransFactory.reset = function () {
        for (var _i = 0, _a = TransFactory.transformers; _i < _a.length; _i++) {
            var tr = _a[_i];
            tr.reset();
        }
    };
    TransFactory.pushVClusters = function () {
        for (var _i = 0, _a = TransFactory.transformers; _i < _a.length; _i++) {
            var tr = _a[_i];
            tr.pushVCluster();
        }
    };
    TransFactory.popVClusters = function () {
        for (var _i = 0, _a = TransFactory.transformers; _i < _a.length; _i++) {
            var tr = _a[_i];
            tr.popVCluster();
        }
    };
    TransFactory.getTransformerByVClusterID = function (id) {
        return TransFactory.transformers.filter(function (tr) { return tr.vCluster.cluster.id == id; })[0];
    };
    TransFactory.displayStatus = function (pos, renderer) {
        renderer.textSize(12);
        renderer.noStroke();
        renderer.fill(255, 255, 255);
        renderer.textAlign(renderer.LEFT);
        var outputString = "Press key number to manipulate local domain zoom: ";
        renderer.fill(150);
        for (var i = 0; i < TransFactory.transformers.length; i++) {
            var tr = TransFactory.transformers[i];
            outputString += tr.vCluster.cluster.id + ". " + tr.vCluster.cluster.label;
            if (tr.active) {
                outputString += ": active";
            }
            outputString += "   ";
        }
        if (TransFactory.transformers.length == 0) {
            outputString = "No clustering domains in tranformer factory";
        }
        renderer.text(outputString, pos.x + 10, pos.y + 35);
        renderer.stroke(255);
    };
    return TransFactory;
}());
exports.TransFactory = TransFactory;
TransFactory.transformers = [];
// Attach TransFactory to the global window object
window.TransFactory = TransFactory;
