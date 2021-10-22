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
            let palette = ColorFactory.getPaletteByIndex(index);

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
        console.log(data);
        this.instantiateCluster(data);
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        let index = ClusterFactory.clusters.length - 1;
        let tmp = new VCluster(ClusterFactory.clusters[index], 15 + x * index, 20, ClusterFactory.wdth, ClusterFactory.hght, ColorFactory.getPaletteByIndex(index));
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
        //console.log("Cluster added. Total: " + ClusterFactory.clusters.length)
    }

    static makeNodes(cluster, data) {
        // create Nodes
        for (let index = 0; index < data.nodes.length; index++) {
            let node = this.makeNode(cluster, data.nodes[index]);
            cluster.addNode(node);
        }
    }

    static makeNode(cluster, data) {
        let node = new Node(cluster.id, data.id, data.pajekIndex);
        node.setLabel(data.nodeLabel);
        node.setDescription(data.nodeDescription);
        node.setNodeShortDescription(data.nodeShortDescription);
        node.setAttributes(data.nodeAttributes);
        node.setImportedVNodeData(data.vNode);
        if (data.pajekIndex > ClusterFactory.countPajek) {
            ClusterFactory.countPajek = data.pajekIndex;
        }
        // create connectors if data comes with that info. Data usually comes from 
        // the JSON file or the node created by user input 
        if (data.connectors) {
            for (const connector of data.connectors) {
                // add connector name to GUI
                if (ContextualGUI.addEdgeCategory(connector)) {
                    // renitialize contextual GUI
                    ContextualGUI.init2(ContextualGUI.edgeCategories);
                    DOM.textboxes.edgeKinds.textContent = ContextualGUI.edgeCategories.join();
                }
                node.addConnector(connector, node.connectors.length);
            }
        }
        ClusterFactory.countPajek++;
        return node;
    }

    static deleteNode(vNode) {
        console.log("delete node " + JSON.stringify(vNode.node.idCat));
        for (let vC of vNode.vConnectors) {
            for (let edgeObs of vC.connector.edgeObservers) {
                // go over all its vConnectors and ask them to delete themselves. That should delete all the edges referencing them
                EdgeFactory.deleteEdge(edgeObs);
            }
        }
        if (vNode.node.connectors.length == 0) {

            // get cluster
            let cluster = this.getCluster(vNode.node.idCat.cluster);
            let vCluster = this.getVCluster(vNode.node.idCat.cluster);

            // get node index
            const indexC = cluster.nodes.indexOf(vNode.node);
            const indexVC = vCluster.vNodes.indexOf(vNode);

            // delete node from array
            cluster.nodes.splice(indexC, 1);
            vCluster.vNodes.splice(indexVC, 1);

            // unsubscribe vNode
            Canvas.unsubscribe(vNode);

            console.log("Node and VNode deleted " + JSON.stringify(vNode.node.idCat));
        }
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
        ClusterFactory.countPajek = 1;
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

    static getVNodeOf(node) {
        let vCluster = ClusterFactory.getVCluster(node.idCat.cluster)
        return vCluster.getVNode(node);
    }

    static getCluster(id) {
        const tmp = ClusterFactory.clusters.filter(elem => {
            return elem.id == id;
        })[0];
        return tmp;
    }

    static getVCluster(id) {
        const tmp = ClusterFactory.vClusters.filter(elem => {
            return elem.cluster.id == id;
        })[0];
        return tmp;
    }

    static findDuplicateNodes() {
        for (let cluster of ClusterFactory.clusters) {
            for (let i = 0; i < cluster.nodes.length; i++) {
                const nodeA = cluster.nodes[i];
                for (let j = i + 1; j < cluster.nodes.length; j++) {
                    const nodeB = cluster.nodes[j];
                    nodeA.equalsTo(nodeB);
                }
            }

        }
    }

    static getNextClusterID() {
        let max = 0;
        for (const cluster of ClusterFactory.clusters) {
            let tmp = cluster.id
            console.log(cluster);
            if (tmp > max) max = tmp
        }
        return parseInt(max) + 1;
    }
}

ClusterFactory.clusters = [];
ClusterFactory.vClusters = [];
ClusterFactory.countPajek = 1;