"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importNetworkModalForm = importNetworkModalForm;
exports.getDataImport = getDataImport;
exports.buildClustersImport = buildClustersImport;
const jquery_1 = __importDefault(require("jquery"));
const DOMManager_1 = require("../DOM/DOMManager");
const canvas_1 = require("../../canvas/canvas");
const clusterFactory_1 = require("../../factories/clusterFactory");
const edgeFactory_1 = require("../../factories/edgeFactory");
const VirtualElementPool_1 = require("../../visualElements/VirtualElementPool");
let nodesImported;
let edgesImported;
function importNetworkModalForm() {
    var networkFile = document.getElementById("dragDropNetwork");
    makeDroppable(networkFile, callbackNetwork);
}
function getDataImport(evt) {
    VirtualElementPool_1.VirtualElementPool.clear();
    // Canvas.clear();
    DOMManager_1.DOM.onLoadNetwork({ nodes: nodesImported, edges: edgesImported }, evt);
}
function callbackNetwork(files) {
    //Only process json files.
    if (files[0].type.endsWith("json")) {
        // NOTE: this is the name of the file read from the file dropped or loaded by
        // the user on the import model form. The data type in this function parameter
        // is unknown and should be a FileList or something of the kind
        document.getElementById("networkFileName").innerHTML = files[0].name;
        loadFile(files[0]);
    }
    else {
        alert("Wrong file extension. Must be a JSON file");
    }
}
function loadFile(file) {
    let reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function (theFile) {
        return function (e) {
            if (e.target instanceof FileReader &&
                typeof e.target.result === "string") {
                try {
                    // Safely parse the JSON string
                    let data = JSON.parse(e.target.result);
                    // Assign parsed data to the appropriate variables
                    nodesImported = data.nodes;
                    edgesImported = data.edges;
                }
                catch (error) {
                    console.error("Failed to parse JSON:", error);
                    alert("The file contains invalid JSON. Please check the file and try again.");
                }
            }
            else {
                console.error("Unexpected FileReader result type:", e.target?.result);
                alert("Failed to read the file. Please try again.");
            }
        };
    })(file);
    // Read in the file as text.
    reader.readAsText(file);
}
function callback(files) {
    console.log("both");
    // console.log(files.getData());
}
//source: https://bitwiser.in/2015/08/08/creating-dropzone-for-drag-drop-file.html
function makeDroppable(element, callback) {
    var input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("multiple", "true");
    input.style.display = "none";
    input.addEventListener("change", triggerCallback);
    element.appendChild(input);
    element.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add("dragover");
    });
    element.addEventListener("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove("dragover");
    });
    element.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove("dragover");
        triggerCallback(e);
    });
    element.addEventListener("click", function () {
        input.value = "null";
        input.click();
    });
    function triggerCallback(e) {
        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        }
        else if (e.target) {
            files = e.target.files;
        }
        callback.call(null, files);
    }
}
// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
    (0, jquery_1.default)("#importNetworkModal").on("hide.bs.modal", function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
/** deprecated */
function buildClustersImport(result) {
    canvas_1.Canvas.resetObservers();
    clusterFactory_1.ClusterFactory.reset();
    clusterFactory_1.ClusterFactory.makeClusters(result);
}
/** deprecated */
function buildEdgesImport(result) {
    edgeFactory_1.EdgeFactory.reset();
    edgeFactory_1.EdgeFactory.buildEdges(result, clusterFactory_1.ClusterFactory.clusters);
}
//# sourceMappingURL=importModalForm.js.map