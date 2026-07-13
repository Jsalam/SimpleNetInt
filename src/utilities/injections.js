"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatVNodeDescription = formatVNodeDescription;
const settingsPanelFactory_1 = require("../factories/settingsPanelFactory");
const clusterFactory_1 = require("../factories/clusterFactory");
function formatVNodeDescription(vNode, attributeList, params = []) {
    let complementaryTextString = "Attributes:\n";
    let cluster = clusterFactory_1.ClusterFactory.getCluster(vNode.node.idCat.cluster);
    let vCluster = clusterFactory_1.ClusterFactory.getVClusterOf(cluster);
    //console.log(attributeList)
    for (const entry of Object.values(attributeList)) {
        if (typeof entry.value === "string" ||
            typeof entry.value === "number" ||
            typeof entry.value === "boolean") {
            // Add the key-value pair to the complementary textString
            complementaryTextString += `   - ${entry.key}: ${entry.value}\n`;
        }
        else {
            // If the value is an array or object, filter it by the first entry of the dimension
            // array of the vCluster
            const settings = settingsPanelFactory_1.SettingsPanelFactory.getSettingsByVCluster(vCluster)?.getDimensionArray();
            const [key, val] = settings[0];
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
            }
            else if (typeof entry.value === "object") {
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
//# sourceMappingURL=injections.js.map