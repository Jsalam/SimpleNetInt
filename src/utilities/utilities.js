"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var main_1 = require("../main");
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    /**
     * Converts a network file exported from BipartiteNetworks in a json format into a pajek file. Output file saved in downloads folder
     *
     * @param {Object} jsonFile The network json file with nodes and edges
     * @param {String} name The name of the output file without extension
     */
    Utilities.convertJSONtoPajek = function (jsonFile, name) {
        var clusters = jsonFile.nodes;
        var edges = jsonFile.edges;
        var pajekNodes = [];
        var pajekEdges = [];
        // get nodes
        for (var i = 0; i < clusters.length; i++) {
            for (var j = 0; j < clusters[i].nodes.length; j++) {
                var nodeSeq = clusters[i].nodes[j].pajekIndex;
                var nodeLab = clusters[i].nodes[j].nodeLabel;
                pajekNodes.push(nodeSeq + " " + '\"' + nodeLab + '\"');
            }
        }
        // get edges
        for (var i = 0; i < edges.length; i++) {
            var sourceID = edges[i].source.pajekIndex;
            var targetID = edges[i].target.pajekIndex;
            var weight = edges[i].weight;
            pajekEdges.push(sourceID + " " + targetID + " " + weight);
        }
        // createStrings
        pajekNodes.unshift("*Vertices " + pajekNodes.length);
        pajekEdges.unshift("*Arcs");
        var pajekOutput = pajekNodes.concat(pajekEdges);
        main_1.gp5.saveStrings(pajekOutput, name + "_pajekNetwork", "net");
        console.log("saved pajek for " + name);
    };
    /**
     * Merges a multiple network files into a single network. It compares nodes and egdes to find equal elements.
     * Unequal nodes are stored in a final JSON object. Equal nodes are not duplicated.
     * Unequal edges are stored in a final JSON object. Equal edges increase the weight of the edge in the final JSON object.
     * The edge weight increase could be weighted by the number of networks merged
     * @param {Object} data
     */
    Utilities.mergeJSON = function (data) {
        var jsonFile = data.network;
        var nFiles = data.n;
        var weighted = data.weighted;
        console.log(jsonFile);
        if (Utilities.mergedJSON.nodes.length < 1) {
            Utilities.mergedJSON.nodes = jsonFile.nodes;
            for (var i = 0; i < jsonFile.edges.length; i++) {
                // take first A edge
                Utilities.addEdge(jsonFile.edges[i], weighted, 1 / nFiles);
            }
            console.log("new json");
        }
        else {
            // Add new nodes
            var clustersNew = jsonFile.nodes;
            for (var i = 0; i < clustersNew.length; i++) {
                for (var j = 0; j < Utilities.mergedJSON.nodes.length; j++) {
                    if (clustersNew[i].clusterID === Utilities.mergedJSON.nodes[j].clusterID) {
                        console.log(clustersNew[i].clusterID);
                        console.log(Utilities.mergedJSON.nodes[j].clusterID);
                        console.log("happy");
                        for (var k = 0; k < clustersNew[i].nodes.length; k++) {
                            var doesNotExist = true;
                            var newNode = clustersNew[i].nodes[k];
                            console.log(newNode.nodeLabel);
                            for (var l = 0; l < Utilities.mergedJSON.nodes[j].nodes.length; l++) {
                                var oldNode = Utilities.mergedJSON.nodes[j].nodes[l];
                                console.log("compared to : " + oldNode.nodeLabel);
                                if (newNode.id === oldNode.id) {
                                    // console.log(newNode.id + " " + oldNode.id)
                                    console.log("exists");
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
            for (var i = 0; i < jsonFile.edges.length; i++) {
                // take first A edge
                var e1 = jsonFile.edges[i];
                var doesNotExist = true;
                //console.log(e1);
                // take every B edge
                // console.log(Utilities.mergedJSON.edges.length)
                for (var j = 0; j < Utilities.mergedJSON.edges.length; j++) {
                    // console.log(Utilities.mergedJSON.edges[j])
                    var e2 = Utilities.mergedJSON.edges[j];
                    // compare sources
                    if (e1.source.pajekIndex === e2.source.pajekIndex) {
                        // if equal  compare the target
                        if (e1.target.pajekIndex === e2.target.pajekIndex) {
                            // if equal increase weight on B edge
                            if (weighted) {
                                e2.weight += 1 / nFiles;
                            }
                            else {
                                e2.weight++;
                            }
                            console.log("equals");
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
    };
    Utilities.addEdge = function (e1, weighted, weight) {
        console.log("**** added ****");
        if (weighted) {
            e1.weight = weight;
        }
        else {
            console.log(e1);
        }
        Utilities.mergedJSON.edges.push(e1);
    };
    Utilities.loadJsonNetworks = function (path, fileNames) {
        var temp = { n: fileNames.length, weighted: true };
        for (var i = 0; i < fileNames.length; i++) {
            main_1.gp5.loadJSON(path + fileNames[i] + "_network.json", function (cb) {
                temp.network = cb;
                Utilities.mergeJSON(temp);
            });
        }
    };
    Utilities.mergedJSON = {
        nodes: [],
        edges: [],
    };
    return Utilities;
}());
exports.Utilities = Utilities;
