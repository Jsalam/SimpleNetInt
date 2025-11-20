"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = getData;
var jquery_1 = require("jquery");
var clusterFactory_1 = require("../../factories/clusterFactory");
var vNode_1 = require("../../visualElements/vNode");
var item_1 = require("../widgets/listWidget/item");
function getData() {
    var cluster = document.querySelector('input[name="cluster"]:checked');
    var name = document.getElementById("catName").value;
    var description = document.getElementById("catDescription").value;
    var attr = document.getElementById("catAttributesOther")
        .value;
    if (cluster) {
        // get the cluster object
        var clusterTmp = clusterFactory_1.ClusterFactory.clusters[parseInt(cluster.value)];
        // format string
        attr = "{" + attr + "}";
        // parse to JSON
        attr = JSON.parse(attr);
        // Merge JSONs
        var attributes = { attr: attr };
        // console.log(attributes);
        var dataTmp = {
            id: clusterTmp.nodes.length,
            nodeLabel: name,
            nodeDescription: description,
            nodeAttributes: attributes,
        };
        var nodeTmp = clusterFactory_1.ClusterFactory.makeNode(clusterTmp, dataTmp);
        // visual representation of the new category
        var vClustTmp = clusterFactory_1.ClusterFactory.getVClusterOf(clusterTmp);
        var vNodeTmp = new vNode_1.VNode(nodeTmp, clusterFactory_1.ClusterFactory.wdth, clusterFactory_1.ClusterFactory.hght, vClustTmp);
        if (nodeTmp instanceof Node) {
            if (nodeTmp.connectors.length > 0) {
                vNodeTmp.addVConnector(nodeTmp.connectors[0]);
            }
        }
        vClustTmp.sortingWidget.addItem(new item_1.Item(vNodeTmp));
        // add to collections
        clusterTmp.addNode(nodeTmp);
        vClustTmp.addVNode(vNodeTmp);
    }
    else {
        alert("You forgot to choose a cluster. Please try again, your data isn't lost.");
    }
}
document.addEventListener("DOMContentLoaded", function () {
    (0, jquery_1.default)("#addNodeModal").on("hide.bs.modal", function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
