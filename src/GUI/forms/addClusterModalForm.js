"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataCluster = getDataCluster;
exports.addClusterToModalFormList = addClusterToModalFormList;
exports.clearClusterModalFormList = clearClusterModalFormList;
var jquery_1 = require("jquery");
var clusterFactory_1 = require("../../factories/clusterFactory");
var transformerFactory_1 = require("../../factories/transformerFactory");
var ContextualGUI_1 = require("../ContextualGUIs/ContextualGUI");
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
    var name = document.getElementById("clusterName").value;
    var description = document.getElementById("clusterDescription").value;
    var id = clusterFactory_1.ClusterFactory.clusters.length + 1;
    var dataTmp = {
        clusterID: id.toString(),
        clusterLabel: name,
        clusterDescription: description,
        nodes: [],
    };
    clusterFactory_1.ClusterFactory.makeCluster(dataTmp);
    // add checkboxes to space contextual menu. Contextual menu created in ContextualGUI.init()
    var transformerTemp = transformerFactory_1.TransFactory.getTransformerByVClusterID(id);
    ContextualGUI_1.ContextualGUI.spacesMenu.addBoolean(name, false, function (val) {
        transformerTemp.setActive(val);
    });
}
function addClusterToModalFormList(id, name) {
    // Create input
    var input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("id", "cluster" + id);
    input.setAttribute("name", "cluster");
    var tmp = parseInt(id) - 1;
    input.setAttribute("value", tmp.toString());
    // Create input label
    var label = document.createElement("label");
    label.setAttribute("for", "cluster" + id);
    label.setAttribute("class", "labelRadioButton");
    label.innerHTML = name;
    label.textContent = name;
    // Append children
    addToDOM("clusterChoice", input);
    addToDOM("clusterChoice", label);
}
function clearClusterModalFormList() {
    var element = document.getElementById("clusterChoice");
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}
function addToDOM(elementID, addition) {
    var element = document.getElementById(elementID);
    element.appendChild(addition);
}
