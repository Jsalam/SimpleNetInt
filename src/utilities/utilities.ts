import { gp5 } from "../main";
import { EdgeInit } from "../graphElements/edge";
import { ClusterInit } from "../factories/clusterFactory";
import { VNode } from "../visualElements/vNode";

export interface JSONFile {
  nodes: Array<ClusterInit>;
  edges: Array<EdgeInit>;
}

export interface MergedJSONFile {
  network?: JSONFile;
  n: number;
  weighted: boolean;
}

export class Utilities {
  static mergedJSON: JSONFile = {
    nodes: [],
    edges: [],
  };

  /**
   * Converts a network file exported from BipartiteNetworks in a json format into a pajek file. Output file saved in downloads folder
   *
   * @param {Object} jsonFile The network json file with nodes and edges
   * @param {String} name The name of the output file without extension
   */
  static convertJSONtoPajek(jsonFile: JSONFile, name: string) {
    let clusters = jsonFile.nodes;
    let edges = jsonFile.edges;
    let pajekNodes = [];
    let pajekEdges = [];

    // get nodes
    for (let i = 0; i < clusters.length; i++) {
      for (let j = 0; j < clusters[i].nodes!.length; j++) {
        let nodeSeq = clusters[i].nodes![j].pajekIndex;
        let nodeLab = clusters[i].nodes![j].nodeLabel;
        pajekNodes.push(nodeSeq + " " + '\"' + nodeLab + '\"');
      }
    }

    // get edges
    for (let i = 0; i < edges.length; i++) {
      let sourceID = edges[i].source.pajekIndex;
      let targetID = edges[i].target.pajekIndex;
      let weight = edges[i].weight;
      pajekEdges.push(sourceID + " " + targetID + " " + weight);
    }

    // createStrings
    pajekNodes.unshift("*Vertices " + pajekNodes.length);

    pajekEdges.unshift("*Arcs");

    let pajekOutput = pajekNodes.concat(pajekEdges);

    gp5.saveStrings(pajekOutput, name + "_pajekNetwork", "net");
    console.log("saved pajek for " + name);
  }

  /**
   * Merges a multiple network files into a single network. It compares nodes and egdes to find equal elements.
   * Unequal nodes are stored in a final JSON object. Equal nodes are not duplicated.
   * Unequal edges are stored in a final JSON object. Equal edges increase the weight of the edge in the final JSON object.
   * The edge weight increase could be weighted by the number of networks merged
   * @param {Object} data
   */
  static mergeJSON(data: MergedJSONFile) {
    let jsonFile = data.network!;
    let nFiles = data.n;
    let weighted = data.weighted;

    console.log(jsonFile);

    if (Utilities.mergedJSON.nodes.length < 1) {
      Utilities.mergedJSON.nodes = jsonFile.nodes;
      for (let i = 0; i < jsonFile.edges.length; i++) {
        // take first A edge
        Utilities.addEdge(jsonFile.edges[i], weighted, 1 / nFiles);
      }
      console.log("new json");
    } else {
      // Add new nodes
      let clustersNew = jsonFile.nodes;
      for (let i = 0; i < clustersNew.length; i++) {
        for (let j = 0; j < Utilities.mergedJSON.nodes.length; j++) {
          if (
            clustersNew[i].clusterID === Utilities.mergedJSON.nodes[j].clusterID
          ) {
            console.log(clustersNew[i].clusterID);
            console.log(Utilities.mergedJSON.nodes[j].clusterID);
            console.log("happy");
            for (let k = 0; k < clustersNew[i].nodes!.length; k++) {
              let doesNotExist = true;
              let newNode = clustersNew[i].nodes![k];
              console.log(newNode.nodeLabel);

              for (
                let l = 0;
                l < Utilities.mergedJSON.nodes[j].nodes!.length;
                l++
              ) {
                let oldNode = Utilities.mergedJSON.nodes[j].nodes![l];
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
                Utilities.mergedJSON.nodes[j].nodes!.push(newNode);
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
                e2.weight += 1 / nFiles;
              } else {
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
  }

  static addEdge(e1: EdgeInit, weighted: boolean, weight: number) {
    console.log("**** added ****");
    if (weighted) {
      e1.weight = weight;
    } else {
      console.log(e1);
    }
    Utilities.mergedJSON.edges.push(e1);
  }

  static loadJsonNetworks(path: string, fileNames: string[]) {
    let temp: MergedJSONFile = { n: fileNames.length, weighted: true };
    for (let i = 0; i < fileNames.length; i++) {
      gp5.loadJSON(
        path + fileNames[i] + "_network.json",
        function (cb: JSONFile) {
          temp.network = cb;
          Utilities.mergeJSON(temp);
        },
      );
    }
  }

  /**
   * It’s a generic recursive traversal helper for inspecting or processing every nested entry in a JSON-like object tree.
   * @param obj The object or array to traverse recursively.
   * @param callback Function called for each property, receiving an object with key, value, and path.
   * @param path Current traversal path represented as an array of keys.
   * @returns void
   */
  static traverse(obj: Object, callback: Function, path: string[] = []) {
    // Skip null and non-objects
    if (obj === null || typeof obj !== "object") {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      // the expression creates a new array containing all elements from
      // path followed by key. So if path is ["a","b"] and key is "c", currentPath
      // becomes ["a","b","c"].
      const currentPath = [...path, key];

      // Call the callback with key, value, and full path
      callback({ key, value, path: currentPath });

      // If value is an object or array, recurse
      if (value !== null && typeof value === "object") {
        this.traverse(value, callback, currentPath);
      }
    }
  }

  /**
   * Calculate minimum and maximum values for a collection of nodes.
   *
   * This method computes two ranges for the provided node list:
   *  - absolute range: the min/max values found for every occurrence of the target variable
   *    in the specified attribute group.
   *  - relative range: the min/max values found for entries matching the filter criteria.
   *
   * @param vNodes Array of VNode objects to inspect.
   * @param param2 Configuration object used to select attribute groups and filter values.
   * @param param2.attrAllKey The key identifying the attribute group inside node.attributes.attAll.
   * @param param2.variableKey The property name whose numeric min/max values should be tracked.
   * @param param2.filteringKey The property name used to filter objects for the relative range.
   * @param param2.filteringValue The required value of filteringKey for relative range comparisons.
   * @returns Object with param, absolute, and relative value ranges.
   */
  static getMinMax(vNodes: VNode[], param2: Record<string, string>) {
    let relativeMin = Infinity;
    let relativeMax = -Infinity;
    let absoluteMin = Infinity;
    let absoluteMax = -Infinity;

    for (const vNode of vNodes) {
      const attributes = vNode.node.attributes;

      // get the specific set of attributes for this node
      const attrs = attributes?.attAll?.[param2.attrAllKey];
      if (!attrs) continue;

      // set absolute min & max
      Utilities.traverse(attrs, (e: any) => {
        if (e.key == param2.variableKey) {
          absoluteMin = Math.min(absoluteMin, Number(e.value));
          absoluteMax = Math.max(absoluteMax, Number(e.value));
        }
      });

      // set relative min max
      for (const attr of Object.values(attrs)) {
        let relativeValue: number = Infinity;

        // the attr could be an array, object or a single value
        if (Array.isArray(attr)) {
          for (const entry of attr) {
            if (entry) continue;

            if (
              entry != null &&
              entry[param2.filteringKey] === param2.filteringValue
            ) {
              relativeValue = entry[param2.variableKey];

              // These are the total relativeMax relativeMin values after reading all the attributes in the dataset
              if (relativeValue !== undefined && relativeValue !== -1) {
                relativeMin = Math.min(relativeMin, Number(relativeValue));
                relativeMax = Math.max(relativeMax, Number(relativeValue));
              }
            }
          }
        } else {
          // If the attr is an object
          if (typeof attr == "object") {
            if (
              attr != null &&
              attr[param2.filteringKey] === param2.filteringValue
            ) {
              relativeValue = attr[param2.variableKey];
            }
          }
          // if the attribute is a string or number
          else if (typeof attr == "string" || typeof attr == "number") {
            relativeValue = Number(attr);
          }
          // These are the total relativeMax relativeMin values after reading all the attributes in the dataset
          if (!isNaN(relativeValue) && relativeValue !== Infinity) {
            relativeMin = Math.min(relativeMin, Number(relativeValue));
            relativeMax = Math.max(relativeMax, Number(relativeValue));
          }
        }
      }
    }

    return {
      param: param2,
      absolute: [absoluteMin, absoluteMax],
      relative: [relativeMin, relativeMax],
    };
  }

  static formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1, // Controls decimal points (e.g., 2.5M)
  });
}
