class UtilitiesNetworkJSON {

    static tempNetwork = null;

    /**
     * Customized for Brazil network files
     * @param {*} network 
     */
    static splitNetworkJSON(network, clusterID, keepOriginal = false) {
        let tempClusts = new Map();
        let rslt = "nothing";
        // get networks
        gp5.loadJSON(network, (data) => {
            console.log(data);
            data.nodes[clusterID].nodes.forEach(node => {
                // console.log(node.nodeAttributes.attRaw.state_abbrev)
                // check if the state is already in the map
                if (!tempClusts.has(node.nodeAttributes.attRaw.state_abbrev)) {
                    // create a new array for the state
                    tempClusts.set(node.nodeAttributes.attRaw.state_abbrev, []);
                    // push the node to the array
                    tempClusts.get(node.nodeAttributes.attRaw.state_abbrev).push(node);
                } else {
                    // if the state is already in the map, push the node to the array
                    tempClusts.get(node.nodeAttributes.attRaw.state_abbrev).push(node);
                }
            });
            // change the original network with the new clusters
            let i = 0
            for (const [key, value] of tempClusts) {
               
                // add the new cluster to the network
                data.nodes.push({
                    clusterID: data.nodes[clusterID].clusterID + "_" + i,
                    clusterType: "geo",
                    clusterLabel: "State name",
                    clusterDescription: "",

                    "nodes": value,
                });
                // console.log(newCluster);
                i++;
            };
            // remove the original clusters
            if (!keepOriginal) {
                data.nodes.splice(0, 2);
                data.edges = [];
            }
            UtilitiesNetworkJSON.tempNetwork = data;
        })
    }
    
}