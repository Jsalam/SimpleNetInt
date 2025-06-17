import QuickSettings, {
  DropDownItems,
  QuickSettingsPanel,
} from "quicksettings";
import { Observer } from "../../types";
import { DOM } from "../DOM/DOMManager";

import "../../../node_modules/quicksettings/quicksettings.css";

/**
 * This class uses the library Quicksettings. See http://bit101.github.io/quicksettings/
 */
export class ContextualGUI {
  static edgeMenu: QuickSettingsPanel<{
    Categories: { value: string };
    [key: string]: any;
  }>;
  static spacesMenu: QuickSettingsPanel;
  static observers: Observer[] = [];
  static edgeCategories: string[] = [];
  static edgeMenuChoice: string;
  static _edgeMenuValue: unknown;

  // This constructor is not needed, but it is here because the documentation generator requires it to format the documentation
  constructor() { }

  static subscribe(obj: Observer) {
    ContextualGUI.observers.push(obj);
  }

  static unsubscribe(obj: Observer) { }

  static notifyObservers(data: unknown) {
    for (const obs of ContextualGUI.observers) {
      obs.getDataFromContextualGUI?.(data);
    }
  }

  /**x
   * Init from string
   * @param {string} kinds comma separated names
   */
  static init(kinds: string | string[]) {
    // Destroy the menu if it exists
    if (ContextualGUI.edgeMenu) {
      ContextualGUI.edgeMenu.destroy();
      ContextualGUI.edgeCategories = [];
    }

    // Create Contextual GUIs edges
    ContextualGUI.createEdgeMenu().then(() => {
      // populate contextual menu
      if (kinds instanceof Array) ContextualGUI.edgeCategories = kinds;
      else ContextualGUI.edgeCategories = kinds.split(",");
      ContextualGUI.addEdgeCheckboxes(
        "Categories",
        ContextualGUI.edgeCategories,
      );
    });

    // Create Contextual GUI spaces
    ContextualGUI.createSpacesMenu();
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
  static async createEdgeMenu(): Promise<void> {
    return new Promise((resolve) => {
      console.log("Creating edge menu");
      ContextualGUI.edgeMenu = QuickSettings.create(
        window.innerWidth - 240,
        window.innerHeight - 240,
        "Edge Menu",
        document.getElementById("model")!,
      );
      // Switch it off if the checkbox is off
      if (!DOM.checkboxes.edit.checked) {
        ContextualGUI.edgeMenu.toggleVisibility();
      }
      resolve();
    });
  }

  /**
   * The menu to toggle individual transformation spaces
   */
  static createSpacesMenu() {
    console.log("Creating spaces menu");

    // Check first if this already exists
    if (!ContextualGUI.spacesMenu) {
      ContextualGUI.spacesMenu = QuickSettings.create(
        window.innerWidth - 540,
        window.innerHeight - 240,
        "Spaces Menu",
        document.getElementById("model")!,
      );
    } else {
      ContextualGUI.clearFloatingMenu(ContextualGUI.spacesMenu);
      //  ContextualGUI.spacesMenu.destroy();
    }
    //Switch it off is the checkbox is off
    if (!DOM.checkboxes.spacesMenu.checked) {
      ContextualGUI.spacesMenu.toggleVisibility();
    }
  }

  static addEdgeCheckboxes(label: string, items: DropDownItems<unknown>) {
    // the callback here is used when a new option is chosen
    ContextualGUI.edgeMenu.addDropDown(label, items, (val) => {
      ContextualGUI.edgeMenuChoice = val.value;
      ContextualGUI.notifyObservers(val.value);
    });
    // get the value of first selected item in the dropdown at the moment of adding new checkboxes
    let tmp = ContextualGUI.edgeMenu.getValue("Categories").value;
    ContextualGUI.notifyObservers(tmp);
    ContextualGUI.edgeMenuChoice = tmp;
  }

  static getValue(val: { value: unknown }) {
    ContextualGUI._edgeMenuValue = val.value;
    console.log("value changed");
  }

  static setEdgeMenuValue(val: { value: unknown }) {
    ContextualGUI._edgeMenuValue = val;
  }

  static addEdgeCategory(cat: string) {
    let rtn = false;
    if (!ContextualGUI.edgeCategories.includes(cat)) {
      ContextualGUI.edgeCategories.push(cat);
      rtn = true;
    }
    return rtn;
  }

  static clearFloatingMenu(menu: QuickSettingsPanel) {
    const values = menu.getValuesAsJSON(false);
     for (const controlName of Object.keys(values)) {
       menu.removeControl(controlName);
     }
  }
}

// Attach ContextualGUI to the global window object
(window as any).ContextualGUI = ContextualGUI;
