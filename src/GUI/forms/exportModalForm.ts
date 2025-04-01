saveJSON = function () {
  let fileSuffix = document.getElementById("exportFileSuffix").value;

  if (fileSuffix) {
    let output = [];
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
};
// Prevent focus on form close
document.addEventListener("DOMContentLoaded", function () {
  $("#exportNetworkModal").on("hide.bs.modal", function () {
    if (document.activeElement) {
      document.activeElement.blur();
    }
  });
});
