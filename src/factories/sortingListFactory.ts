import { SortingWidget } from '../GUI/widgets/listWidget/sortingWidget';
import { VNode } from '../visualElements/vNode';
import { DOM } from '../GUI/DOM/DOMManager';
import { VCluster } from '../visualElements/vCluster';
import { ClusterFactory } from './clusterFactory';
import { ItemList } from '../GUI/widgets/listWidget/itemList';

export class SortingListFactory {
    static widgets: SortingWidget[];
    static itemLists: { [key: string]: ItemList };

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

    static makeSortingWidget(label: string, width?: number, height?: number): SortingWidget {

        let vNodes = SortingListFactory.getVNodesFromCluster(label) ?? [];

        // Retrive the ItemList from the static itemLists object. if not found, create a new one
        if (SortingListFactory.itemLists[label]) {

           // get SortingListFactory.itemLists[label]!;
        } else {
            //create a new one
        }


        // Create a list of items from the vNodes
        let items: ItemList = new ItemList(vNodes);

        // Create a new sorting list
        let sortingWidget = new SortingWidget(label, width, height);

        // subscribe the sorting widget to the item list. This method updates the list of items in the sorting widget.
        sortingWidget.subscribe(items);

        // Update the list of observers in the given item list
        items.addObserver(sortingWidget);

        // Add the sorting list to the static lists array
        SortingListFactory.widgets.push(sortingWidget);

        SortingListFactory.itemLists[sortingWidget.id] = items;

        return sortingWidget;
    }
}

SortingListFactory.widgets = [];
SortingListFactory.itemLists = {};

// Attach ClusterFactory to the global window object
(window as any).SortingListFactory = SortingListFactory;