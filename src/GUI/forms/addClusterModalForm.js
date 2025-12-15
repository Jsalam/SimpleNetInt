"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataCluster = getDataCluster;
exports.addClusterToModalFormList = addClusterToModalFormList;
exports.clearClusterModalFormList = clearClusterModalFormList;
const jquery_1 = __importDefault(require("jquery"));
const clusterFactory_1 = require("../../factories/clusterFactory");
// addClusterModalForm = function() {
//     document.getElementById("SubmitAddClusterModal").onclick = getDataCluster
// }
// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
    (0, jquery_1.default)("#addClusterModal").on("hide.bs.modal", function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
function getDataCluster() {
    let name = document.getElementById("clusterName").value;
    let description = document.getElementById("clusterDescription").value;
    let id = clusterFactory_1.ClusterFactory.clusters.length + 1;
    let dataTmp = {
        clusterID: id.toString(),
        clusterLabel: name,
        clusterDescription: description,
        nodes: [],
    };
    clusterFactory_1.ClusterFactory.makeCluster(dataTmp);
    // add checkboxes to space contextual menu. Contextual menu created in ContextualGUI.init()
    // let transformerTemp = TransFactory.getTransformerByVClusterID(id);
    // ContextualGUI.spacesMenu.addBoolean(name, false, (val) => {
    //   transformerTemp.setActive(val);
    // });
}
function addClusterToModalFormList(id, name) {
    // Create input
    let input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("id", "cluster" + id);
    input.setAttribute("name", "cluster");
    let tmp = parseInt(id) - 1;
    input.setAttribute("value", tmp.toString());
    // Create input label
    let label = document.createElement("label");
    label.setAttribute("for", "cluster" + id);
    label.setAttribute("class", "labelRadioButton");
    label.innerHTML = name;
    label.textContent = name;
    // Append children
    addToDOM("clusterChoice", input);
    addToDOM("clusterChoice", label);
}
function clearClusterModalFormList() {
    let element = document.getElementById("clusterChoice");
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}
function addToDOM(elementID, addition) {
    let element = document.getElementById(elementID);
    element.appendChild(addition);
}
//# sourceMappingURL=addClusterModalForm.js.map