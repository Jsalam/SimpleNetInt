import { SortingList } from '../GUI/widgets/listWidget/sortingList';
import { VNode } from '../visualElements/vNode';
import { Item } from '../GUI/widgets/listWidget/item';
import { DOM } from '../GUI/DOM/DOMManager';
import { VCluster } from '../visualElements/vCluster';
import { ClusterFactory } from './clusterFactory';

export class SortingListFactory {
    static lists: SortingList[];
    static items: { [key: string]: Item };

    static getListByLabel(label: string): SortingList {

        console.log(SortingListFactory.lists);

        // Find the sorting list by label
        let rtn: SortingList | undefined = SortingListFactory.lists.find(list => list.label === label);

        if (rtn === undefined) {

            // get the vNodes in the sorting list
            const cluster: VCluster | undefined = ClusterFactory.getVClusterByLabel(label);

            if (!cluster) {
                console.warn("No cluster found with label: " + label);
                rtn = undefined
            }

            const vNodes = cluster.vNodes ?? [];
            rtn = this.makeSortingList(vNodes, label);
        }

        return rtn
    }

    static makeSortingList(vNodes: VNode[], label: string, width?: number, height?: number): SortingList {

        // Create a list of items from the vNodes
        let items: Item[] = vNodes.map(vNode => new Item(vNode));

        // Create a new sorting list
        let sortingList = new SortingList(items, label, width, height);

        // Add the sorting list to the static lists array
        SortingListFactory.lists.push(sortingList);

        return sortingList;
    }
}

SortingListFactory.lists = [];
SortingListFactory.items = {};

// Attach ClusterFactory to the global window object
(window as any).SortingListFactory = SortingListFactory;