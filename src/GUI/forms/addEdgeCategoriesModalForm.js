"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextBoxContent = getTextBoxContent;
const jquery_1 = __importDefault(require("jquery"));
const DOMManager_1 = require("../DOM/DOMManager");
const ContextualGUI_1 = require("../ContextualGUIs/ContextualGUI");
const colorFactory_1 = require("../../factories/colorFactory");
/**
 * Invoked when the user clicks the submit button in the Edge Kinds textbox
 * @param {*} evt
 */
function getTextBoxContent(evt) {
    // Add checkboxes to Filters list B in the DOM
    DOMManager_1.DOM.createCheckboxFor(DOMManager_1.DOM.textboxes.edgeKinds.value, DOMManager_1.DOM.lists.filtersB);
    // Initialize the list of Edge Menu contextual GUI. Contextual menu created in ContextualGUI.init()
    ContextualGUI_1.ContextualGUI.init(DOMManager_1.DOM.textboxes.edgeKinds.value);
    // Add checkboxes to Space Menu contextual GUI. Contextual menu created in ContextualGUI.init()
    // for (const cluster of ClusterFactory.clusters) {
    //   let transformerTemp = TransFactory.getTransformerByVClusterID(cluster.id);
    //   ContextualGUI.spacesMenu.addBoolean(cluster.label!, false, (val) => {
    //     transformerTemp.setActive(val);
    //   });
    // }
    // Create color dictionary for connectors
    colorFactory_1.ColorFactory.makeDictionary(DOMManager_1.DOM.textboxes.edgeKinds.value, colorFactory_1.ColorFactory.getCategoricalPalette('palette1'), "connectors");
}
//Prevent focus on modal close
document.addEventListener("DOMContentLoaded", function () {
    (0, jquery_1.default)("#addKindModal").on("hide.bs.modal", function () {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});
//# sourceMappingURL=addEdgeCategoriesModalForm.js.map