class ClusterFactory {

    static makeClusters(data) {
        ClusterFactory.clusters = [];
        this.vClusters = [];
        for (let index = 0; index < Object.keys(data).length; index++) {
            this.instantiateCluster(data[index]);
        }
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            ClusterFactory.vClusters.push(new VCluster(ClusterFactory.clusters[index], 15 + x * index, 20, ClusterFactory.wdth, ClusterFactory.hght, ColorFactory.getPalette(index)));
        }
    }

    static makeCluster(data) {
        this.instantiateCluster(data);
        let x = ClusterFactory.wdth + ClusterFactory.gutter;
        let index = ClusterFactory.clusters.length - 1;
        console.log(index)
        ClusterFactory.vClusters.push(new VCluster(ClusterFactory.clusters[index], 15 + x * index, 20, ClusterFactory.wdth, ClusterFactory.hght, ColorFactory.getPalette(index)));
    }

    static setParameters(wdth, hght, gutter) {
        ClusterFactory.wdth = wdth;
        ClusterFactory.hght = hght;
        ClusterFactory.gutter = gutter;
    }

    static instantiateCluster(data) {
        let cluster = new Cluster(data.clusterID);
        cluster.setLabel(data.clusterLabel);
        cluster.setDescription(data.clusterDescription);
        this.makeCategories(cluster, data);
        ClusterFactory.clusters.push(cluster);
        console.log("Cluster added. Total: " + ClusterFactory.clusters.length)
    }

    static makeCategories(cluster, data) {
        // create categories
        for (let index = 0; index < data.nodes.length; index++) {
            let category = this.makeCategory(cluster, data.nodes[index]);
            cluster.addCategory(category);
        }
    }

    static makeCategory(cluster, data) {
        let category = new Node(cluster.id, data.id, ClusterFactory.countCat);
        category.setLabel(data.nodeLabel);
        category.setDescription(data.nodeDescription);
        category.setPolarity(data.polarity);
        ClusterFactory.countCat++;

        // create connectors
        switch (data.polarity) {
            case 'LEFT':
                category.addNegativeConnector(category.negatives.length);
                break;;
            case 'RIGHT':
                category.addPositiveConnector(category.positives.length);
                break;;
            default:
                category.addNegativeConnector(category.negatives.length);
                category.addPositiveConnector(category.positives.length);
        }
        return category;
    }

    static recordJSON(suffix) {
        let filename = "nodes.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = [];
        for (let index = 0; index < ClusterFactory.clusters.length; index++) {
            output.push(ClusterFactory.clusters[index].getJSON());
        }
        globalP5.saveJSON(output, filename);
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

    static refreshColors(clusterIndex, palette) {
        ClusterFactory.vClusters[clusterIndex].setPalette(palette);
    }

    static resetAllConnectors() {
        for (const cluster of ClusterFactory.clusters) {
            for (const node of cluster.categories) {
                node.resetConnectors();
            }
        }
    }
}

ClusterFactory.clusters = [];
ClusterFactory.vClusters = [];
ClusterFactory.countCat = 1;