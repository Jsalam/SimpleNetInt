import $ from "jquery";
import { DOM } from "../DOM/DOMManager";
import { Canvas } from "../../canvas/canvas";
import { ClusterFactory, ClusterInit } from "../../factories/clusterFactory";
import { Edge } from "../../graphElements/edge";
import { EdgeFactory } from "../../factories/edgeFactory";
import { VirtualElementPool } from "../../visualElements/VirtualElementPool";

let nodesImported: ClusterInit[];
let edgesImported: Edge[];

export function importNetworkModalForm() {
  var networkFile = document.getElementById("dragDropNetwork") as HTMLElement;
  makeDroppable(networkFile, callbackNetwork);
}

export function getDataImport(evt: UIEvent) {
  VirtualElementPool.clear();
  // Canvas.clear();
  DOM.onLoadNetwork({ nodes: nodesImported, edges: edgesImported }, evt);
}

function callbackNetwork(files: Array<Blob>) {
  //Only process json files.
  if (files[0].type.endsWith("json")) {
    // @ts-ignore FIXME: `.name` doesn't exist
    document.getElementById("networkFileName")!.innerHTML = files[0].name;
    loadFile(files[0]);
  } else {
    alert("Wrong file extension. Must be a JSON file");
  }
}

function loadFile(file: Blob) {
  let reader = new FileReader();
  // Closure to capture the file information.
  reader.onload = (function (theFile) {
    return function (e) {
      // Read text data and parse to JSON.
      // @ts-ignore FIXME: unsafe
      let data = JSON.parse(e.target.result);

      nodesImported = data.nodes;
      edgesImported = data.edges;
    };
  })(file);
  // Read in the file as text.
  reader.readAsText(file);
}

function callback(files: unknown) {
  console.log("both");
  // @ts-ignore FIXME: unknown type
  console.log(files.getData());
}

//source: https://bitwiser.in/2015/08/08/creating-dropzone-for-drag-drop-file.html
function makeDroppable(element: HTMLElement, callback: Function) {
  var input = document.createElement("input");
  input.setAttribute("type", "file");
  // @ts-ignore FIXME: should be string
  input.setAttribute("multiple", true);
  input.style.display = "none";

  input.addEventListener("change", triggerCallback as (e: Event) => void);
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
    // @ts-ignore FIXME: should be string
    input.value = null;
    input.click();
  });

  function triggerCallback(e: DragEvent | InputEvent) {
    var files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = (e.target as HTMLInputElement).files;
    }
    callback.call(null, files);
  }
}

// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
  $("#importNetworkModal").on("hide.bs.modal", function () {
    if (document.activeElement) {
      (document.activeElement as HTMLInputElement).blur();
    }
  });
});

/** deprecated */
export function buildClustersImport(result: ClusterInit[]) {
  Canvas.resetObservers();
  ClusterFactory.reset();
  ClusterFactory.makeClusters(result);
}

/** deprecated */
function buildEdgesImport(result: Edge[]) {
  EdgeFactory.reset();
  EdgeFactory.buildEdges(result, ClusterFactory.clusters);
}
