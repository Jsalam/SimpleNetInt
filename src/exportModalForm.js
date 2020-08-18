exportNetworkModalForm = function() {

    document.getElementById("exportNetwork").onclick = saveJSON;
}

saveJSON = function() {

    let fileSuffix = document.getElementById("exportFileSuffix").value;

    if (fileSuffix) {
        let output = [];
        let nodes = [];
        let edges = [];
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            nodes.push(ClusterFactory.vClusters[index].getJSON());
        }
        for (let index = 0; index < EdgeFactory.edges.length; index++) {
            edges.push(EdgeFactory.edges[index].id);
        }
        output = { nodes: nodes, edges: edges }

        let filename = "network.json";
        if (fileSuffix) {
            filename = fileSuffix + "_" + filename;
        }
        globalP5.saveJSON(output, filename);
    } else {
        alert("Missing file name");
    }

}