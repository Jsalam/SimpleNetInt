import { SortingWidget } from '../GUI/widgets/listWidget/sortingWidget';
import { VNode } from '../visualElements/vNode';
import { VCluster } from '../visualElements/vCluster';
import { ClusterFactory } from './clusterFactory';
import { Item } from '../GUI/widgets/listWidget/item'

export class SortingListFactory {
    static widgets: SortingWidget[];

    /**
     *  This method creates a new sorting widget from an array of vNodes. It is mainly ised in the DOMManager file
     * @param label The name of the space or cluster
     * @param width The widget width
     * @param height The widget height
     * @returns the sorting widget object
     */
    static makeSortingWidget(label: string, width?: number, height?: number): SortingWidget {

        let vNodes = SortingListFactory.getVNodesFromCluster(label) ?? [];

        // Create a list of items from the vNodes
        let items: Item[] = SortingListFactory.makeItems(vNodes);

        // Create a new sorting list
        let sortingWidget = new SortingWidget(items, label, width, height);

        // Add the sorting list to the static lists array
        SortingListFactory.widgets.push(sortingWidget);

        return sortingWidget;
    }

    static makeItems(vNodes: VNode[]) {
        let items: Item[] = [];
        for (let i = 0; i < vNodes.length; i++) {
            let item = new Item(vNodes[i]);
            items.push(item);
        }
        return items;
    }

    /**
     * @param label 
     * @returns 
     */
    static getWidgetByLabel(label: string): SortingWidget | undefined {

        // Find the sorting list by label
        let rtn: SortingWidget | undefined = SortingListFactory.widgets.find(widget => widget.label === label);

        return rtn
    }

    static getWidgetByID(id: string): SortingWidget | undefined {

        // Find the sorting list by label
        let rtn: SortingWidget | undefined = SortingListFactory.widgets.find(widget => widget.id === id);

        return rtn
    }

    static getVNodesFromCluster(label: string): VNode[] | undefined {
        // Get the cluster by label
        const cluster: VCluster | undefined = ClusterFactory.getVClusterByLabel(label);
        if (!cluster) {
            console.warn("No cluster found with label: " + label);
            return undefined;
        }
        // Get the vNodes from the cluster
        const vNodes = cluster.vNodes ?? [];
        return vNodes;
    }
}

SortingListFactory.widgets = [];

// Attach ClusterFactory to the global window object
(window as any).SortingListFactory = SortingListFactory;