getData = function() {
    let cluster = document.querySelector('input[name="cluster"]:checked');
    let name = document.getElementById("catName").value;
    let description = document.getElementById("catDescription").value;
    let attr = document.getElementById("catAttributesOther").value;

    if (cluster) {
        let clusterTmp = ClusterFactory.clusters[cluster.value];
        // format string
        attr = '{' + attr + '}';
        // parse to JSON
        attr = JSON.parse(attr);
        // Merge JSONs
        let attributes = { attr };
        // console.log(attributes);

        let dataTmp = {
            id: clusterTmp.nodes.length,
            nodeLabel: name,
            nodeDescription: description,
            nodeAttributes: attributes,
        }

        let nodeTmp = ClusterFactory.makeNode(clusterTmp, dataTmp)

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