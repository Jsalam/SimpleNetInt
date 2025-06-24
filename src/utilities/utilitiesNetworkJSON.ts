import { gp5 } from "../main";
import { JSONFile } from "./utilities";

class UtilitiesNetworkJSON {
  static tempNetwork: JSONFile | null = null;

  /**
   * Customized for Brazil network files
   * @param {*} JSONnetwork the file URL
   * @param {*} clusterID the index of the cluster in the nodes object
   */
  static splitNetwork(
    JSONnetwork: string,
    clusterID: number,
    keepOriginal = false,
  ) {
    let tempClusts = new Map();
    // get networks
    gp5.loadJSON(JSONnetwork, (data: JSONFile) => {
      console.log(data);
      // FIXME: the JSON structure has changed
      // data.nodes[clusterID].nodes!.forEach((node) => {
      //   // console.log(node.nodeAttributes.attRaw.state_abbrev)
      //   // check if the state is already in the map
      //   if (!tempClusts.has(node.nodeAttributes.attRaw!.state_abbrev)) {
      //     // create a new array for the state
      //     tempClusts.set(node.nodeAttributes.attRaw!.state_abbrev, []);
      //     // push the node to the array
      //     tempClusts.get(node.nodeAttributes.attRaw!.state_abbrev).push(node);
      //   } else {
      //     // if the state is already in the map, push the node to the array
      //     tempClusts.get(node.nodeAttributes.attRaw!.state_abbrev).push(node);
      //   }
      // });
      // change the original network with the new clusters
      let i = 0;
      for (const [key, value] of tempClusts) {
        // add the new cluster to the network
        data.nodes.push({
          clusterID: data.nodes[clusterID].clusterID + "_" + i,
          clusterType: "geo",
          clusterLabel: "State name",
          clusterDescription: "",

          nodes: value,
        });
        // console.log(newCluster);
        i++;
      }
      // remove the original clusters
      if (!keepOriginal) {
        data.nodes.splice(0, 2);
        data.edges = [];
      }
      UtilitiesNetworkJSON.tempNetwork = data;
    });
  }
}
