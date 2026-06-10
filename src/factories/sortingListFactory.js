"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingListFactory = void 0;
const sortingWidget_1 = require("../GUI/widgets/listWidget/sortingWidget");
const clusterFactory_1 = require("./clusterFactory");
const item_1 = require("../GUI/widgets/listWidget/item");
class SortingListFactory {
    static widgets;
    /**
     *  This method creates a new sorting widget from an array of vNodes. It is mainly used in the DOMManager file
     * @param label The name of the space or cluster
     * @param width The widget width
     * @param height The widget height
     * @returns the sorting widget object
     */
    static makeSortingWidget(label, // this is the cluster name 
    width, height) {
        // get the vNodes to create the items for the sorting list
        // let vNodes = SortingListFactory.getVNodeLookup() ?? [];
        // Create a list of items from the vNodes
        let items = SortingListFactory.makeItems2(label);
        // Create a new sorting list
        let sortingWidget = new sortingWidget_1.SortingWidget(items, label, width, height);
        // Add the sorting list to the static lists array
        SortingListFactory.widgets.push(sortingWidget);
        return sortingWidget;
    }
    static makeItems2(clusterLabel) {
        let items = [];
        for (const vNode of clusterFactory_1.ClusterFactory.getVClusterByLabel(clusterLabel).vNodes) {
            let item = new item_1.Item(vNode);
            // observer pattern
            vNode.subscribe(item);
            // add item to collection
            items.push(item);
        }
        return items;
    }
    // static makeItems(vNodesById: Record<string, VNode[]>) {
    //   let items: Item[] = [];
    //   for (const [id, vNodes] of Object.entries(vNodesById)) {
    //     let item = new Item(vNodes);
    //     // observer pattern
    //     for (const vNode of vNodes) {
    //       vNode.subscribe(item);
    //     }
    //     // add item to collection
    //     items.push(item);
    //   }
    //   return items;
    // }
    /**
     * @param label
     * @returns
     */
    static getWidgetByLabel(label) {
        // Find the sorting list by label
        let rtn = SortingListFactory.widgets.find((widget) => widget.label === label);
        return rtn;
    }
    static getWidgetByID(id) {
        // Find the sorting list by label
        let rtn = SortingListFactory.widgets.find((widget) => widget.id === id);
        return rtn;
    }
    static getVNodeLookup() {
        const vNodesById = {};
        for (const vCluster of clusterFactory_1.ClusterFactory.vClusters) {
            for (const vNode of vCluster.vNodes) {
                const index = String(vNode.node.idCat.index);
                if (!vNodesById[index]) {
                    vNodesById[index] = [];
                }
                vNodesById[index].push(vNode);
            }
        }
        return vNodesById;
    }
}
exports.SortingListFactory = SortingListFactory;
SortingListFactory.widgets = [];
// Attach ClusterFactory to the global window object
window.SortingListFactory = SortingListFactory;
//# sourceMappingURL=sortingListFactory.js.map