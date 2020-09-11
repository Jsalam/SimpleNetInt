getData = function() {
    let cluster = document.querySelector('input[name="cluster"]:checked');
    let name = document.getElementById("catName").value;
    let description = document.getElementById("catDescription").value;

    if (cluster) {
        let clusterTmp = ClusterFactory.clusters[cluster.value];
        console.log(clusterTmp);

        let dataTmp = {
            id: clusterTmp.nodes.length,
            nodeLabel: name,
            nodeDescription: description,
        }
        console.log(dataTmp);
        let nodeTmp = ClusterFactory.makeNode(clusterTmp, dataTmp)
        console.log(nodeTmp);

        // visual representation of the new category
        let vClustTmp = ClusterFactory.getVClusterOf(clusterTmp);
        let vNodeTmp = new VNode(nodeTmp, ClusterFactory.wdth, ClusterFactory.hght);
        if (nodeTmp instanceof Node) {
            if (nodeTmp.connectors.length > 0) {
                vNodeTmp.addVConnector(nodeTmp.connectors[0]);
            }
        }

        // add to collections
        clusterTmp.addNode(nodeTmp);
        vClustTmp.addVNode(vNodeTmp);

    } else {
        alert("You forgot to choose a cluster. Please try again, your data isn't lost.")
    }

}