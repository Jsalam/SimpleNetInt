import { SettingsPanelFactory } from "../factories/settingsPanelFactory";
import { ClusterFactory } from "../factories/clusterFactory";
import { VNode } from "../visualElements/vNode";

// Custom type for the dataset to match the expected structure for the injection function
export type DataEntry = { key: string; value: any | any[] };


/**
 * Formats a description of a VNode by extracting and organizing its attributes.
 * 
 * @param {VNode} vNode - The VNode to format the description for
 * @param {DataEntry} attributeList - Array of key-value pairs representing the node's attributes
 * @param {string[]} params - Array of parameter names to filter which attributes to include in the output.
 *                 Defaults to ["president", "votes", "votesPercentage"]. If empty, all attributes are included.
 * @returns {string} A formatted string containing the node's attributes organized by type
 * 
 * This function:
 * - Retrieves the cluster and vCluster information for the VNode
 * - Processes simple attributes (string, number, boolean) and adds them to the output
 * - For complex attributes (arrays or objects), filters them by the first dimension setting
 * - Only includes attributes whose keys are in the params array (or all if params is empty)
 */
export function formatVNodeDescription(
  vNode: VNode,
  attributeList: DataEntry[],
  //params: string[] = [],
  params: string[] = ["president", "votes", "votesPercentage"],
  //params: string[] = ["core", "crop", "state"],
): string {
  let complementaryTextString: string = "Attributes:\n";

  let cluster = ClusterFactory.getCluster(vNode.node.idCat.cluster);
  let vCluster = ClusterFactory.getVClusterOf(cluster);

  //console.log(attributeList)

  for (const entry of Object.values(attributeList)) {
    if (
      typeof entry.value === "string" ||
      typeof entry.value === "number" ||
      typeof entry.value === "boolean"
    ) {
      // Add the key-value pair to the complementary textString
      complementaryTextString += `   - ${entry.key}: ${entry.value}\n`;
    } else {
      // If the value is an array or object, filter it by the first entry of the dimension
      // array of the vCluster
      const settings = SettingsPanelFactory.getSettingsByVCluster(
        vCluster!,
      )?.getDimensionArray();

      const [key, val] = settings![0];
      complementaryTextString += `\n   ${entry.key}\n`;

      if (Array.isArray(entry.value)) {
        for (let i = 0; i < entry.value.length; i++) {
          let element = entry.value[i];
          if (element.hasOwnProperty(key) && element[key] === val) {
            // add the rest of the key-value pairs of the element to the complementary textString
            for (const [innerKey, innerValue] of Object.entries(element)) {
              // evaluate if innerKey matches any of the strings in params; if params is not provided, include all
              if (!params || params.length === 0 || params.includes(innerKey)) {
                complementaryTextString += `    - ${innerKey}: ${innerValue}\n`;
              }
            }
          }
        }
      } else if (typeof entry.value === "object") {
        for (const [innerKey, innerValue] of Object.entries(entry.value)) {
          // evaluate if innerKey matches any of the strings in params; if params is not provided, include all
          if (!params || params.length === 0 || params.includes(innerKey)) {
            complementaryTextString += `    - ${innerKey}: ${innerValue}\n`;
          }
        }
      }
    }
  }
  // Return an empty description by default
  return complementaryTextString;
}
