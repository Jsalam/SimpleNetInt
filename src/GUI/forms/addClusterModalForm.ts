import $ from "jquery";
import { ClusterFactory, ClusterInit } from "../../factories/clusterFactory";
import { TransFactory } from "../../factories/transformerFactory";
import { ContextualGUI } from "../ContextualGUIs/ContextualGUI";

// addClusterModalForm = function() {
//     document.getElementById("SubmitAddClusterModal").onclick = getDataCluster
// }
// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
  $("#addClusterModal").on("hide.bs.modal", function () {
    if (document.activeElement) {
      (document.activeElement as HTMLInputElement).blur();
    }
  });
});

export function getDataCluster() {
  let name = (document.getElementById("clusterName") as HTMLInputElement).value;
  let description = (
    document.getElementById("clusterDescription") as HTMLInputElement
  ).value;
  let id = ClusterFactory.clusters.length + 1;

  let dataTmp: ClusterInit = {
    clusterID: id.toString(),
    clusterLabel: name,
    clusterDescription: description,
    nodes: [],
  };
  ClusterFactory.makeCluster(dataTmp);

  // add checkboxes to space contextual menu. Contextual menu created in ContextualGUI.init()
  let transformerTemp = TransFactory.getTransformerByVClusterID(id);
  ContextualGUI.spacesMenu.addBoolean(name, false, (val) => {
    transformerTemp.setActive(val);
  });
}

export function addClusterToModalFormList(id: string, name: string) {
  // Create input
  let input = document.createElement("input");
  input.setAttribute("type", "radio");
  input.setAttribute("id", "cluster" + id);
  input.setAttribute("name", "cluster");
  // @ts-ignore FIXME: should be string
  input.setAttribute("value", id - 1);

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

export function clearClusterModalFormList() {
  let element = document.getElementById("clusterChoice")!;
  while (element.firstChild) {
    element.removeChild(element.lastChild!);
  }
}

function addToDOM(elementID: string, addition: Node) {
  let element = document.getElementById(elementID)!;
  element.appendChild(addition);
}
