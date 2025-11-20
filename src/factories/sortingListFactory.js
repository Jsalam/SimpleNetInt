"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingListFactory = void 0;
var sortingWidget_1 = require("../GUI/widgets/listWidget/sortingWidget");
var clusterFactory_1 = require("./clusterFactory");
var item_1 = require("../GUI/widgets/listWidget/item");
var SortingListFactory = /** @class */ (function () {
    function SortingListFactory() {
    }
    /**
     *  This method creates a new sorting widget from an array of vNodes. It is mainly ised in the DOMManager file
     * @param label The name of the space or cluster
     * @param width The widget width
     * @param height The widget height
     * @returns the sorting widget object
     */
    SortingListFactory.makeSortingWidget = function (label, width, height) {
        var _a;
        var vNodes = (_a = SortingListFactory.getVNodeLookup()) !== null && _a !== void 0 ? _a : [];
        // Create a list of items from the vNodes
        var items = SortingListFactory.makeItems(vNodes);
        // Create a new sorting list
        var sortingWidget = new sortingWidget_1.SortingWidget(items, label, width, height);
        // Add the sorting list to the static lists array
        SortingListFactory.widgets.push(sortingWidget);
        return sortingWidget;
    };
    SortingListFactory.makeItems = function (vNodesById) {
        var items = [];
        for (var _i = 0, _a = Object.entries(vNodesById); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], vNodes = _b[1];
            var item = new item_1.Item(vNodes[0]);
            for (var _c = 0, vNodes_1 = vNodes; _c < vNodes_1.length; _c++) {
                var vNode = vNodes_1[_c];
                vNode.subscribe(item);
            }
            items.push(item);
        }
        return items;
    };
    /**
     * @param label
     * @returns
     */
    SortingListFactory.getWidgetByLabel = function (label) {
        // Find the sorting list by label
        var rtn = SortingListFactory.widgets.find(function (widget) { return widget.label === label; });
        return rtn;
    };
    SortingListFactory.getWidgetByID = function (id) {
        // Find the sorting list by label
        var rtn = SortingListFactory.widgets.find(function (widget) { return widget.id === id; });
        return rtn;
    };
    SortingListFactory.getVNodeLookup = function () {
        var vNodesById = {};
        for (var _i = 0, _a = clusterFactory_1.ClusterFactory.vClusters; _i < _a.length; _i++) {
            var vCluster = _a[_i];
            for (var _b = 0, _c = vCluster.vNodes; _b < _c.length; _b++) {
                var vNode = _c[_b];
                var index = String(vNode.node.idCat.index);
                if (!vNodesById[index]) {
                    vNodesById[index] = [];
                }
                vNodesById[index].push(vNode);
            }
        }
        return vNodesById;
    };
    return SortingListFactory;
}());
exports.SortingListFactory = SortingListFactory;
SortingListFactory.widgets = [];
// Attach ClusterFactory to the global window object
window.SortingListFactory = SortingListFactory;
