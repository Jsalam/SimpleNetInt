"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJSON = saveJSON;
const jquery_1 = __importDefault(require("jquery"));
const clusterFactory_1 = require("../../factories/clusterFactory");
const edgeFactory_1 = require("../../factories/edgeFactory");
const main_1 = require("../../main");
function saveJSON() {
    let fileSuffix = document.getElementById("exportFileSuffix").value;
    if (fileSuffix) {
        let output = [];
        let nodes = [];
        let edges = [];
        for (let index = 0; index < clusterFactory_1.ClusterFactory.clusters.length; index++) {
            nodes.push(clusterFactory_1.ClusterFactory.vClusters[index].getJSON());
        }
        for (let index = 0; index < edgeFactory_1.EdgeFactory._edges.length; index++) {
            edges.push(edgeFactory_1.EdgeFactory._edges[index].getJSON());
        }
        output = { nodes: nodes, edges: edges };
        let filename = "network.json";
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
//# sourceMappingURL=exportModalForm.js.map