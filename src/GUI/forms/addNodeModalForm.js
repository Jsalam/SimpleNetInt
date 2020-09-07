getData = function() {
    let cluster = document.querySelector('input[name="cluster"]:checked');
    let name = document.getElementById("catName").value;
    let description = document.getElementById("catDescription").value;
    let positive = document.getElementById("positive").checked;
    let negative = document.getElementById("negative").checked;

    if (cluster) {
        let clusterTmp = ClusterFactory.clusters[cluster.value];
        let polarityTmp;
        if (positive & !negative) {
            polarityTmp = 'RIGHT'
        } else if (negative & !positive) {
            polarityTmp = 'LEFT'
        } else {
            polarityTmp = 'BOTH'
        }
        let dataTmp = {
            id: clusterTmp.nodes.length,
            nodeLabel: name,
            nodeDescription: description,
            polarity: polarityTmp
        }
        let nodeTmp = ClusterFactory.makeNode(clusterTmp, dataTmp)

        // visual representation of the new category
        let vClustTmp = ClusterFactory.getVClusterOf(clusterTmp);
        let vNodeTmp = new VNode(nodeTmp, ClusterFactory.wdth, ClusterFactory.hght);
        if (nodeTmp instanceof Node) {
            if (nodeTmp.connectors.length > 0) {
                vNodeTmp.addVConnector(nodeTmp.connectors[0]);
            }
        } else if (nodeTmp instanceof BipartiteNode) {
            if (positive) {
                vNodeTmp.addPositiveVConnector(nodeTmp.positives[0]);
            }
            if (negative) {
                vNodeTmp.addNegativeVConnector(nodeTmp.negatives[0]);
            }
        }

        // add to collections
        clusterTmp.addNode(nodeTmp);
        vClustTmp.addVNode(vNodeTmp);

    } else {
        alert("You forgot to choose a cluster. Please try again, your data isn't lost.")
    }

}