class Utilities {

    /**
     * Converts a network file exported from BipartiteNetworks in a json format into a pajek file. Output file saved in downloads folder
     * 
     * @param {Object} jsonFile The network json file with nodes and edges
     * @param {String} name The name of the output file without extension 
     */
    static convertJSONtoPajek(jsonFile, name) {
        let clusters = jsonFile.nodes;
        let edges = jsonFile.edges;
        let pajekNodes = [];
        let pajekEdges = [];

        // get nodes
        for (let i = 0; i < clusters.length; i++) {
            for (let j = 0; j < clusters[i].nodes.length; j++) {
                let nodeSeq = clusters[i].nodes[j].pajekIndex;
                let nodeLab = clusters[i].nodes[j].nodeLabel;
                pajekNodes.push(nodeSeq + " " + '\"' + nodeLab + '\"');
            }
        }

        // get edges
        for (let i = 0; i < edges.length; i++) {
            let sourceID = edges[i].source.pajekIndex;
            let targetID = edges[i].target.pajekIndex;
            let weight = edges[i].weight;
            pajekEdges.push(sourceID + " " + targetID + " " + weight)
        }

        // createStrings
        pajekNodes.unshift("*Vertices " + pajekNodes.length);

        pajekEdges.unshift("*Arcs")

        let pajekOutput = pajekNodes.concat(pajekEdges)

        globalP5.saveStrings(pajekOutput, name + "_pajekNetwork", "net")
        console.log("saved pajek for " + name)
    }

    /**
     * Merges a multiple network files into a single network. It compares nodes and egdes to find equal elements. 
     * Unequal nodes are stored in a final JSON object. Equal nodes are not duplicated.
     * Unequal edges are stored in a final JSON object. Equal edges increase the weight of the edge in the final JSON object.
     * The edge weight increase could be weighted by the number of networks merged 
     * @param {Object} data 
     */
    static mergeJSON(data) {

        let jsonFile = data.network;
        let nFiles = data.n;
        let weighted = data.weighted

        console.log(jsonFile)

        if (Utilities.mergedJSON.nodes.length < 1) {
            Utilities.mergedJSON.nodes = jsonFile.nodes;
            for (let i = 0; i < jsonFile.edges.length; i++) {
                // take first A edge
                Utilities.addEdge(jsonFile.edges[i], weighted, 1 / nFiles)
            }
            console.log("new json")
        } else {
            // Add new nodes
            let clustersNew = jsonFile.nodes;
            for (let i = 0; i < clustersNew.length; i++) {
                for (let j = 0; j < Utilities.mergedJSON.nodes.length; j++) {
                    if (clustersNew[i].clusterID === Utilities.mergedJSON.nodes[j].clusterID) {
                        console.log(clustersNew[i].clusterID)
                        console.log(Utilities.mergedJSON.nodes[j].clusterID)
                        console.log("happy")
                        for (let k = 0; k < clustersNew[i].nodes.length; k++) {
                            let doesNotExist = true;
                            let newNode = clustersNew[i].nodes[k];
                            console.log(newNode.nodeLabel)

                            for (let l = 0; l < Utilities.mergedJSON.nodes[j].nodes.length; l++) {
                                let oldNode = Utilities.mergedJSON.nodes[j].nodes[l];
                                console.log("compared to : " + oldNode.nodeLabel)

                                if (newNode.id === oldNode.id) {
                                    // console.log(newNode.id + " " + oldNode.id)
                                    console.log("exists")
                                    doesNotExist = false;
                                    break;
                                }
                            }
                            console.log("doesNotExist " + doesNotExist);
                            if (doesNotExist) {
                                // console.log(clustersNew[i].clusterID)
                                // console.log(Utilities.mergedJSON.nodes[j].clusterID)
                                // console.log(newNode.id)
                                Utilities.mergedJSON.nodes[j].nodes.push(newNode);
                            }
                        }
                    }
                }
            }

            // add new edges or increase weight
            for (let i = 0; i < jsonFile.edges.length; i++) {
                // take first A edge
                let e1 = jsonFile.edges[i];
                let doesNotExist = true;
                //console.log(e1);
                // take every B edge
                // console.log(Utilities.mergedJSON.edges.length)
                for (let j = 0; j < Utilities.mergedJSON.edges.length; j++) {
                    // console.log(Utilities.mergedJSON.edges[j])
                    let e2 = Utilities.mergedJSON.edges[j];
                    // compare sources
                    if (e1.source.pajekIndex === e2.source.pajekIndex) {
                        // if equal  compare the target
                        if (e1.target.pajekIndex === e2.target.pajekIndex) {
                            // if equal increase weight on B edge
                            if (weighted) {
                                e2.weight += (1 / nFiles);
                            } else {
                                e2.weight++;
                            }
                            console.log("equals")
                            doesNotExist = false;
                            // console.log(e1)
                            // console.log(e2)
                            break;
                        }
                    }
                }
                if (doesNotExist) {
                    // Add edge
                    Utilities.addEdge(e1, weighted, 1 / nFiles);
                }
            }
        }
    }

    static addEdge(e1, weighted, weight) {
        console.log("**** added ****")
        if (weighted) {
            e1.weight = weight;
        } else {
            console.log(e1)
        }
        Utilities.mergedJSON.edges.push(e1);
    }

    static loadJsonNetworks(path, fileNames) {
        let temp = { n: fileNames.length, weighted: true }
        for (let i = 0; i < fileNames.length; i++) {
            globalP5.loadJSON(path + fileNames[i] + "_network.json", function (cb) {
                temp.network = cb;
                Utilities.mergeJSON(temp)
            });
        }
    }
}
Utilities.mergedJSON = {nodes:[], edges:[]};