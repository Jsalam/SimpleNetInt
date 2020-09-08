class ClusterFactory {

    static makeClusters(data) {
        ClusterFactory.initParameters();
        ClusterFactory.clusters = [];
        this.vClusters = [];


        // global function from addClusterModalForm.js
        clearClusterModalFormList();
        for (let index = 0; index < Object.keys(data).length; index++) {
            this.instantiateCluster(data[index]);
        }

        //** Visual cluster section
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {

            //  vCluster parameters
            let cluster = ClusterFactory.clusters[index];
            let posX = 15 + x * index;
            let posY = 20;
            let width = ClusterFactory.width;
            let height = ClusterFactory.height;
            let palette = ColorFactory.getPalette(index);

            // vCluster instantiation
            let tmp = new VCluster(cluster, posX, posY, width, height, palette);
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
    static initParameters() {
        ClusterFactory.wdth = 30;
        ClusterFactory.hght = 30;
        ClusterFactory.gutter = 110;
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
        node.setImportedVNodeData(data.vNode);
        ClusterFactory.countCat++;
        // create connectors if data comes with that info. Data usually comes from 
        // the JSON file or the node created by user input 
        if (data.connectors) {
            for (const connector of data.connectors) {
                node.addConnector(connector, node.connectors.length);
            }
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

    static checkPropagation() {
        for (const vCluster of ClusterFactory.vClusters) {
            for (const vNode of vCluster.vNodes) {
                if (vNode.propagated) {
                    vNode.node.propagate(vNode.node, vNode.propagated);
                };
            }
        }
    }

}

ClusterFactory.clusters = [];
ClusterFactory.vClusters = [];
ClusterFactory.countCat = 1;