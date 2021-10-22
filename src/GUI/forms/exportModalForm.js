saveJSON = function(name) {
    let fileSuffix = document.getElementById("exportFileSuffix").value;

    console.log(fileSuffix);

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
        output = { nodes: nodes, edges: edges }


        let filename = "network.json";

        if (name instanceof String) {
            filename = name + "_" + filename;
        } else {
            if (fileSuffix) {
                filename = fileSuffix + "_" + filename;
            }
        }

        gp5.saveJSON(output, filename);
    } else {
        alert("Missing file name");
    }

}