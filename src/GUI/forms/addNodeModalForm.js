"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = getData;
const clusterFactory_1 = require("../../factories/clusterFactory");
const vNode_1 = require("../../visualElements/vNode");
function getData() {
    let cluster = document.querySelector('input[name="cluster"]:checked');
    let name = document.getElementById("catName").value;
    let description = document.getElementById("catDescription").value;
    let attr = document.getElementById("catAttributesOther").value;
    if (cluster) {
        // get the cluster object
        let clusterTmp = clusterFactory_1.ClusterFactory.clusters[parseInt(cluster.value)];
        // format string
        attr = "{" + attr + "}";
        // parse to JSON
        attr = JSON.parse(attr);
        // Merge JSONs
        let attributes = { attr };
        // console.log(attributes);
        let dataTmp = {
            id: clusterTmp.nodes.length,
            nodeLabel: name,
            nodeDescription: description,
            nodeAttributes: attributes,
        };
        let nodeTmp = clusterFactory_1.ClusterFactory.makeNode(clusterTmp, dataTmp);
        // visual representation of the new category
        let vClustTmp = clusterFactory_1.ClusterFactory.getVClusterOf(clusterTmp);
        let vNodeTmp = new vNode_1.VNode(nodeTmp, clusterFactory_1.ClusterFactory.wdth, clusterFactory_1.ClusterFactory.hght, vClustTmp);
        if (nodeTmp instanceof Node) {
            if (nodeTmp.connectors.length > 0) {
                vNodeTmp.addVConnector(nodeTmp.connectors[0]);
            }
        }
        // vClustTmp.sortingWidget!.addItem(new Item(vNodeTmp));
        // add to collections
        clusterTmp.addNode(nodeTmp);
        vClustTmp.addVNode(vNodeTmp);
    }
    else {
        alert("You forgot to choose a cluster. Please try again, your data isn't lost.");
    }
}
// Function to close the modal
// function closeModal(id: string) {
//   const modalElement = document.getElementById(id);
//   if (modalElement) {
//     // getOrCreateInstance prevents creating multiple copies of the same modal
//     const modalInstance = Modal.getOrCreateInstance(modalElement);
//     modalInstance.hide();
//     // Accessibility Fix: Return focus to the body or a specific button
//     (document.activeElement as HTMLElement)?.blur();
//   }
// }
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('addNodeModal')?.addEventListener("hide.bs.modal", function () {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement?.blur();
        }
    });
});
//# sourceMappingURL=addNodeModalForm.js.map