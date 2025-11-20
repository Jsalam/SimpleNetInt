"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextBoxContent = getTextBoxContent;
var jquery_1 = require("jquery");
var DOMManager_1 = require("../DOM/DOMManager");
var ContextualGUI_1 = require("../ContextualGUIs/ContextualGUI");
var clusterFactory_1 = require("../../factories/clusterFactory");
var transformerFactory_1 = require("../../factories/transformerFactory");
var colorFactory_1 = require("../../factories/colorFactory");
/**
 * Invoked when the user clicks the submit button in the Edge Kinds textbox
 * @param {*} evt
 */
function getTextBoxContent(evt) {
    // Add checkboxes to Filters list B in the DOM
    DOMManager_1.DOM.createCheckboxFor(DOMManager_1.DOM.textboxes.edgeKinds.value, DOMManager_1.DOM.lists.filtersB);
    // Initialize the list of Edge Menu contextual GUI. Contextual menu created in ContextualGUI.init()
    ContextualGUI_1.ContextualGUI.init(DOMManager_1.DOM.textboxes.edgeKinds.value);
    var _loop_1 = function (cluster) {
        var transformerTemp = transformerFactory_1.TransFactory.getTransformerByVClusterID(cluster.id);
        ContextualGUI_1.ContextualGUI.spacesMenu.addBoolean(cluster.label, false, function (val) {
            transformerTemp.setActive(val);
        });
    };
    // Add checkboxes to Space Menu contextual GUI. Contextual menu created in ContextualGUI.init()
    for (var _i = 0, _a = clusterFactory_1.ClusterFactory.clusters; _i < _a.length; _i++) {
        var cluster = _a[_i];
        _loop_1(cluster);
    }
    // Create color dictionary for connectors
    colorFactory_1.ColorFactory.makeDictionary(DOMManager_1.DOM.textboxes.edgeKinds.value, colorFactory_1.ColorFactory.getPalette(1), "connectors");
}
//Prevent focus on modal close
document.addEventListener("DOMContentLoaded", function () {
    (0, jquery_1.default)("#addKindModal").on("hide.bs.modal", function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
