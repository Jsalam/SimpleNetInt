
exportNetworkModalForm = function () {

    document.getElementById("exportNetwork").onclick = getData1;
}

getData1 = function () {

    let fileSuffix = document.getElementById("exportFileSuffix").value;
    // let includeNodes = document.getElementById("includeNodes").checked;
    // let includeEdges = document.getElementById("includeEdges").checked;

    if (fileSuffix) {

        //    if (includeNodes && !includeEdges){
        //     ClusterFactory.recordJSON(fileSuffix);
        //    }
        //    if (includeEdges && !includeNodes){
        //     EdgeFactory.recordJSON(fileSuffix);
        //    }
        // if (!includeNodes && !includeEdges) {
        //     alert("Select either nodes, edges or both")
        // } else {
            let output = [];
            let nodes = [];
            let edges = [];
            for (let index = 0; index < ClusterFactory.clusters.length; index++) {
                nodes.push(ClusterFactory.clusters[index].getJSON());
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
       // }
    } else {
        alert("Missing file name");
    }

}

