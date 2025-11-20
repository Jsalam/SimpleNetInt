"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJSON = saveJSON;
var jquery_1 = require("jquery");
var clusterFactory_1 = require("../../factories/clusterFactory");
var edgeFactory_1 = require("../../factories/edgeFactory");
var main_1 = require("../../main");
function saveJSON() {
    var fileSuffix = document.getElementById("exportFileSuffix").value;
    if (fileSuffix) {
        var output = [];
        var nodes = [];
        var edges = [];
        for (var index = 0; index < clusterFactory_1.ClusterFactory.clusters.length; index++) {
            nodes.push(clusterFactory_1.ClusterFactory.vClusters[index].getJSON());
        }
        for (var index = 0; index < edgeFactory_1.EdgeFactory._edges.length; index++) {
            edges.push(edgeFactory_1.EdgeFactory._edges[index].getJSON());
        }
        output = { nodes: nodes, edges: edges };
        var filename = "network.json";
        if (fileSuffix) {
            filename = fileSuffix + "_" + filename;
        }
        main_1.gp5.saveJSON(output, filename);
    }
    else {
        alert("Missing file name");
    }
}
// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
    (0, jquery_1.default)("#exportNetworkModal").on("hide.bs.modal", function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
