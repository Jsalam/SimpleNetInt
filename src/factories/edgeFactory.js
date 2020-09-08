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

            // look for the category in the X' nodes
            let sourceCtgTemp;
            for (const ctgr of sourceTemp.nodes) {
                if (ctgr.idCat.index == e.source.cat) {
                    sourceCtgTemp = ctgr;
                    break;
                }
            }

            if (!sourceCtgTemp) {
                console.log("ERROR. trying to add an edge to missing source category");
                console.log(sourceTemp);
            }

            // get nodes connector generator
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


            // look for the category in the X' nodes
            let targetCtgTemp;
            for (const ctgr of targetTemp.nodes) {
                if (ctgr.idCat.index == e.target.cat) {
                    targetCtgTemp = ctgr;
                    break;
                }
            }

            if (!targetCtgTemp) {
                console.log("Error trying to add an edge to missing target category");
                console.log(targetTemp);
            }

            // get nodes connector generator
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
        return EdgeFactory._edges;
    }

    static recordJSON(suffix) {
        let filename = "edges.json";
        if (suffix) {
            filename = suffix + "_" + filename;
        }
        let output = [];
        for (let index = 0; index < EdgeFactory._edges.length; index++) {
            output.push(EdgeFactory._edges[index].id);
        }
        gp5.saveJSON(output, filename);
    }

    static reset() {
        EdgeFactory._edges = [];
        EdgeFactory._vEdges = [];
    }

    static deleteLastEdge() {
        let lastEdge = EdgeFactory._edges.pop();
        lastEdge.source.popThisConnector();
        lastEdge.target.popThisConnector();
        EdgeFactory._vEdges.pop();
        console.log(" Edge deleted linking category: " +
            lastEdge.source.nodeObserver.label + ", in cluster: " +
            lastEdge.id.source.cluster + " with category: " +
            lastEdge.target.nodeObserver.label + ", in cluster: " +
            lastEdge.id.target.cluster);
    }

    static isThereOpenEdge() {
        let rtn = false;
        // get the last element
        let lastEdge = EdgeFactory._edges.slice(-1)[0];
        if (lastEdge) {
            rtn = lastEdge.open;
        }
        return rtn;
    }

    static pushEdge(edge) {
        if (edge instanceof Edge) {
            // let edgeInList = EdgeFactory.contains(EdgeFactory._edges, edge);
            // if (edgeInList) {
            //     console.log("Duplicated edge. Weight increased by 1")
            //     edgeInList.increaseWeight();

            // } else {
            // console.log("not in Factory");
            EdgeFactory._edges.push(edge);
            // }
        }
    }

    static pushVEdge(vEdge) {
        if (vEdge instanceof VEdge) {
            let vEdgeInList = !EdgeFactory.contains(EdgeFactory._vEdges, vEdge)
            if (vEdgeInList) {
                EdgeFactory._vEdges.push(vEdge);
            }
        } else {
            console.log("vEdge duplicated")
        }
    }

    static getLastEdge() {
        return EdgeFactory._edges.slice(-1)[0];
    }

    static getLastVEdge() {
        return EdgeFactory._vEdges.slice(-1)[0];
    }

    static contains(list, edgeA) {
        let rtn = list.filter(edgeB => {
            if (EdgeFactory.compareEdges(edgeA, edgeB)) {
                return edgeB;
            }
        })[0];
        return rtn;
    }

    //** Serves to evaluate if two edges are equal by comparing their source and target pajekIndexes. */
    static compareEdges(edgeA, edgeB) {
        let A, B;
        if (edgeA.target) {
            A = [edgeA.source.idCat.pajekIndex, edgeA.target.idCat.pajekIndex];
        } else {
            A = [edgeA.source.idCat.pajekIndex, undefined];
        }
        if (edgeB.target) {
            B = [edgeB.source.idCat.pajekIndex, edgeB.target.idCat.pajekIndex];
        } else {
            B = [edgeB.source.idCat.pajekIndex, undefined];
        }
        return (A[0] === B[0] && A[1] === B[1]);
    }

}

EdgeFactory._edges = [];
EdgeFactory._vEdges = [];