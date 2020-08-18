
class EdgeFactory {

    static buildEdges(edgs, clusters) {

        for (let index = 0; index < Object.keys(edgs).length; index++) {

            // take the source ID: cluster, cat and polarity
            let e = edgs[index];

            // look for the  cluster X in the clusters collection
            let sourceTemp;
            let targetTemp;
            for (const c of clusters) {
                let foundST = { source: false, target: false };
                try {
                    if (c.id == e.source.cluster) {
                        sourceTemp = c;
                        foundST.source = true;
                    }
                } catch (error) {
                    console.log(edgs)
                }
                if (c.id == e.target.cluster) {
                    targetTemp = c;
                    foundST.target = true;
                }
                if (foundST.source && foundST.target) {
                    break;
                }
            }

            // look for the category in the X' categories
            let sourceCtgTemp;
            for (const ctgr of sourceTemp.categories) {
                if (ctgr.idCat.index == e.source.cat) {
                    sourceCtgTemp = ctgr;
                    break;
                }
            }

            if (!sourceCtgTemp) {
                console.log("ERROR. trying to add an edge to missing source category");
                console.log(sourceTemp);
            }

            // get categories connector generator
            let connSource;
            if (e.source.polarity == true) {
                connSource = sourceCtgTemp.positives[sourceCtgTemp.positives.length - 1];
            } else {
                connSource = sourceCtgTemp.negatives[sourceCtgTemp.negatives.length - 1];
            }

            // ask the connector to sproutEdge
            let edge = connSource.workOnLastEdge();
            connSource.notifyObserver(edge);
            connSource.vConnectorObserver.workOnLastVEdge(edge);


            // look for the category in the X' categories
            let targetCtgTemp;
            for (const ctgr of targetTemp.categories) {
                if (ctgr.idCat.index == e.target.cat) {
                    targetCtgTemp = ctgr;
                    break;
                }
            }

            if (!targetCtgTemp) {
                console.log("Error trying to add an edge to missing target category");
                console.log(targetTemp);
            }

            // get categories connector generator
            let connTarget;
            if (e.target.polarity == true) {
                connTarget = targetCtgTemp.positives[targetCtgTemp.positives.length - 1];
            } else {
                connTarget = targetCtgTemp.negatives[targetCtgTemp.negatives.length - 1];
            }

            // ask the connector to sproutEdge
            edge = connTarget.workOnLastEdge();
            connTarget.notifyObserver(edge);
            connTarget.vConnectorObserver.workOnLastVEdge(edge);
        }
    }

    static get EDGES() {
        return EdgeFactory.edges;
    }

    static recordJSON(suffix) {
        let filename = "edges.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = [];
        for (let index = 0; index < EdgeFactory.edges.length; index++) {
            output.push(EdgeFactory.edges[index].id);
        }
        globalP5.saveJSON(output, filename);
    }

    static reset() {
        console.log('Edges re-initialized');
        EdgeFactory.edges = [];
        EdgeFactory.vEdges = [];
    }

    static deleteLastEdge() {
        let lastEdge = EdgeFactory.edges.pop();
        lastEdge.source.popThisConnector();
        lastEdge.target.popThisConnector();
        EdgeFactory.vEdges.pop();
        console.log(" Edge deleted linking category: "
            + lastEdge.source.nodeObserver.label + ", in cluster: "
            + lastEdge.id.source.cluster + " with category: "
            + lastEdge.target.nodeObserver.label + ", in cluster: "
            + lastEdge.id.target.cluster);
    }
}

EdgeFactory.edges = [];
EdgeFactory.vEdges = [];