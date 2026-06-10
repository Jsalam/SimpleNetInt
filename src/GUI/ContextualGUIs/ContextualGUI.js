"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextualGUI = void 0;
const quicksettings_1 = __importDefault(require("quicksettings"));
const DOMManager_1 = require("../DOM/DOMManager");
require("../../../node_modules/quicksettings/quicksettings.css");
/**
 * This class uses the library Quicksettings. See http://bit101.github.io/quicksettings/
 */
class ContextualGUI {
    static edgeMenu;
    //static spacesMenu: QuickSettingsPanel;
    static observers = [];
    static edgeCategories = [];
    static edgeMenuChoice;
    static _edgeMenuValue;
    // This constructor is not needed, but it is here because the documentation generator requires it to format the documentation
    constructor() { }
    static subscribe(obj) {
        ContextualGUI.observers.push(obj);
    }
    static unsubscribe(obj) { }
    static notifyObservers(data) {
        for (const obs of ContextualGUI.observers) {
            obs.getDataFromContextualGUI?.(data);
        }
    }
    /**x
     * Init from string
     * @param {string} kinds comma separated names
     */
    static init(kinds) {
        // Destroy the menu if it exists
        if (ContextualGUI.edgeMenu) {
            ContextualGUI.edgeMenu.destroy();
            ContextualGUI.edgeCategories = [];
        }
        // Create Contextual GUIs edges
        ContextualGUI.createEdgeMenu().then(() => {
            // populate contextual menu
            if (kinds instanceof Array)
                ContextualGUI.edgeCategories = kinds;
            else
                ContextualGUI.edgeCategories = kinds.split(",");
            ContextualGUI.addEdgeCheckboxes('', ContextualGUI.edgeCategories);
        });
        // Create Contextual GUI spaces
        // ContextualGUI.createSpacesMenu();
    }
    /**
     * This function is not being used.
     *
     * Init from collection of strings
     * param {*} collection collection of strings
     */
    // static init2(collection: string[]) {
    //   // Destroy the menu if it exists
    //   if (ContextualGUI.edgeMenu) {
    //     ContextualGUI.edgeMenu.destroy();
    //   }
    //   // Create Contextual GUI edges
    //   ContextualGUI.createEdgeMenu();
    //   ContextualGUI.addEdgeCheckboxes("Categories", collection);
    // }
    /**
     * The menu to choose edge kinds
     */
    static async createEdgeMenu() {
        return new Promise((resolve) => {
            console.log("Creating edge menu");
            ContextualGUI.edgeMenu = quicksettings_1.default.create(window.innerWidth - 240, window.innerHeight - 240, "Edge options", document.getElementById("model"));
            // Switch it off if the checkbox is off
            if (!DOMManager_1.DOM.checkboxes.editEdgeMenu.checked) {
                ContextualGUI.edgeMenu.toggleVisibility();
            }
            resolve();
        });
    }
    /**
     * The menu to toggle individual transformation spaces
     *
     * @deprecated This function is not being used. Nov 2025.
     */
    // static createSpacesMenu() {
    //   console.log("Creating spaces menu");
    //   // Check first if this already exists
    //   if (!ContextualGUI.spacesMenu) {
    //     ContextualGUI.spacesMenu = QuickSettings.create(
    //       window.innerWidth - 540,
    //       window.innerHeight - 240,
    //       "Spaces Menu",
    //       document.getElementById("model")!,
    //     );
    //   } else {
    //     ContextualGUI.clearFloatingMenu(ContextualGUI.spacesMenu);
    //     //  ContextualGUI.spacesMenu.destroy();
    //   }
    //   //Switch it off is the checkbox is off
    //   if (!DOM.checkboxes.spacesMenu.checked) {
    //     ContextualGUI.spacesMenu.toggleVisibility();
    //   }
    // }
    static addEdgeCheckboxes(label, items) {
        // the callback here is used when a new option is chosen
        ContextualGUI.edgeMenu.addDropDown(label, items, (val) => {
            ContextualGUI.edgeMenuChoice = val.value;
            ContextualGUI.notifyObservers(val.value);
        });
        // get the value of first selected item in the dropdown at the moment of adding new checkboxes
        // Using '' as label to get the first value because the list of edge options is titled ''.
        let tmp = ContextualGUI.edgeMenu.getValue('').value;
        ContextualGUI.notifyObservers(tmp);
        ContextualGUI.edgeMenuChoice = tmp;
    }
    static getValue(val) {
        ContextualGUI._edgeMenuValue = val.value;
        console.log("value changed");
    }
    static setEdgeMenuValue(val) {
        ContextualGUI._edgeMenuValue = val;
    }
    static addEdgeCategory(cat) {
        let rtn = false;
        if (!ContextualGUI.edgeCategories.includes(cat)) {
            ContextualGUI.edgeCategories.push(cat);
            rtn = true;
        }
        return rtn;
    }
    static clearFloatingMenu(menu) {
        const values = menu.getValuesAsJSON(false);
        for (const controlName of Object.keys(values)) {
            menu.removeControl(controlName);
        }
    }
}
exports.ContextualGUI = ContextualGUI;
// Attach ContextualGUI to the global window object
window.ContextualGUI = ContextualGUI;
//# sourceMappingURL=ContextualGUI.js.map