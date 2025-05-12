import $ from "jquery";
import { ClusterFactory } from "../../factories/clusterFactory";
import { EdgeFactory } from "../../factories/edgeFactory";
import { gp5 } from "../../main";

export function saveJSON() {
  let fileSuffix = (
    document.getElementById("exportFileSuffix") as HTMLInputElement
  ).value;

  if (fileSuffix) {
    let output: object = [];
    let nodes = [];
    let edges = [];
    for (let index = 0; index < ClusterFactory.clusters.length; index++) {
      nodes.push(ClusterFactory.vClusters[index].getJSON());
    }
    for (let index = 0; index < EdgeFactory._edges.length; index++) {
      edges.push(EdgeFactory._edges[index].getJSON());
    }
    output = { nodes: nodes, edges: edges };

    let filename = "network.json";
    if (fileSuffix) {
      filename = fileSuffix + "_" + filename;
    }
    gp5.saveJSON(output, filename);
  } else {
    alert("Missing file name");
  }
}

// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
  $("#exportNetworkModal").on("hide.bs.modal", function () {
    if (document.activeElement) {
      (document.activeElement as HTMLInputElement).blur();
    }
  });
});
