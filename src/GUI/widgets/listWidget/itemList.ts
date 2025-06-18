import { Item } from './item';
import { VNode } from '../../../visualElements/vNode';
import { SortingWidget } from './sortingWidget';

export class ItemList {
    id: string | undefined;
    label: string | undefined;
    items: Item[] = [];
    widgetObservers: SortingWidget[] = [];

    constructor(vNodes: VNode[]) {
        this.id;
        this.label;
        this.items = this.makeItems(vNodes);
        this.widgetObservers = [];
    }

    addObserver(widget: SortingWidget) {
        this.widgetObservers.push(widget);
    }

    notifyObservers(obj: any) {
        for (let i = 0; i < this.widgetObservers.length; i++) {
            this.widgetObservers[i].fromItemList(obj);
        }
    }

    /**
     * 
     * @param vNodes
     * @returns 
     */
    private makeItems(vNodes: VNode[]) {
        let items: Item[] = [];
        for (let i = 0; i < vNodes.length; i++) {
            let item = new Item(vNodes[i]);
            items.push(item);
        }
        return items;
    }

    /**
     *   This method adds a new item to the item list.
     *   It creates a new Item instance from the provided VNode and adds it to the items array.
     *   It also notifies all subscribed widgets about the new item.
     * @param vNode the VNode to create an Item from
     * @returns void
     */
    addItem(vNode: VNode) {
        let item = new Item(vNode);
        this.items.push(item);
        // Notify all subscribed widgets about the new item
        this.notifyObservers(item);
    }
}