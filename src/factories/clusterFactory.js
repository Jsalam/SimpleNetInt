class ClusterFactory {

    static makeClusters(data) {
        ClusterFactory.clusters = [];
        this.vClusters = [];
        // global function from addClusterModalForm.js
        clearClusterModalFormList();
        for (let index = 0; index < Object.keys(data).length; index++) {
            this.instantiateCluster(data[index]);
        }
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            let tmp = new VCluster(ClusterFactory.clusters[index], 15 + x * index, 20, ClusterFactory.wdth, ClusterFactory.hght, ColorFactory.getPalette(index));
            Canvas.subscribe(tmp);
            ClusterFactory.vClusters.push(tmp);
        }
    }

    /**
     * This function is used to create a new cluster in addition to the ones loaded from the imported json network
     * @param {Object} data cluster attributes. Usually entered with a form
     */
    static makeCluster(data) {
        this.instantiateCluster(data);
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        let index = ClusterFactory.clusters.length - 1;
        let tmp = new VCluster(ClusterFactory.clusters[index], 15 + x * index, 20, ClusterFactory.wdth, ClusterFactory.hght, ColorFactory.getPalette(index));
        Canvas.subscribe(tmp);
        ClusterFactory.vClusters.push(tmp);
    }

    /**
     * Layuot parameters 
     * @param {number} wdth node width
     * @param {number} hght node height. only used whith rectangular node shape
     * @param {number} gutter gap between columns of clusters
     */
    static setParameters(wdth, hght, gutter) {
        ClusterFactory.wdth = wdth;
        ClusterFactory.hght = hght;
        ClusterFactory.gutter = gutter;
    }

    static instantiateCluster(data) {
        let cluster = new Cluster(data.clusterID);
        cluster.setLabel(data.clusterLabel);
        cluster.setDescription(data.clusterDescription);
        this.makeNodes(cluster, data);
        ClusterFactory.clusters.push(cluster);
        // global function from addClusterModalForm.js
        addClusterToModalFormList(data.clusterID, data.clusterLabel);
        console.log("Cluster added. Total: " + ClusterFactory.clusters.length)
    }

    static makeNodes(cluster, data) {
        // create Nodes
        for (let index = 0; index < data.nodes.length; index++) {
            let node = this.makeNode(cluster, data.nodes[index]);
            cluster.addNode(node);
        }
    }

    static makeNode(cluster, data) {
        let node = new Node(cluster.id, data.id, ClusterFactory.countCat);
        node.setLabel(data.nodeLabel);
        node.setDescription(data.nodeDescription);
        node.setPolarity(data.polarity);
        node.setImportedVNodeData(data.vNode);
        ClusterFactory.countCat++;

        // create connectors
        switch (data.polarity) {
            case 'LEFT':
                node.addNegativeConnector(node.negatives.length);
                break;;
            case 'RIGHT':
                node.addPositiveConnector(node.positives.length);
                break;;
            default:
                node.addNegativeConnector(node.negatives.length);
                node.addPositiveConnector(node.positives.length);
        }
        return node;
    }

    /**This is not the function used by the exportModalFrom */
    static recordJSON(suffix) {
        let filename = "nodes.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = [];
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            output.push(ClusterFactory.clusters[index].getJSON());
        }
        gp5.saveJSON(output, filename);
    }

    static reset() {
        console.log("Clusters re-intialized")
        ClusterFactory.clusters = [];
        ClusterFactory.vClusters = [];
        ClusterFactory.countCat = 1;
    }

    static getVClusterOf(cluster) {
        for (const vClust of ClusterFactory.vClusters) {
            if (vClust.cluster.id == cluster.id)
                return vClust;
        }
    }

    static resetAllConnectors() {
        for (const cluster of ClusterFactory.clusters) {
            for (const node of cluster.nodes) {
                node.resetConnectors();
            }
        }
    }
}

ClusterFactory.clusters = [];
ClusterFactory.vClusters = [];
ClusterFactory.countCat = 1;