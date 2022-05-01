/** 
 * This class uses the library Quicksettings. See http://bit101.github.io/quicksettings/
 */
class ContextualGUI {
    // This constructor is not needed, but it is here because the documentation generator requires it to format the documentation
    constructor() {}

    static subscribe(obj) { ContextualGUI.observers.push(obj) }

    static unsubscribe(obj) {}

    static notifyObservers(data) {
        for (const obs of ContextualGUI.observers) {
            obs.getDataFromContextualGUI(data);
        }
    }

    /**
     * Init from string 
     * @param {string} kinds comma separated names
     */
    static init(kinds) {
        if (ContextualGUI.edgeMenu && ContextualGUI.edgeMenu._content) {
            ContextualGUI.edgeMenu.destroy();
        }

        // Create Contextual GUI
        ContextualGUI.createEdgeMenu();

        // populate contextual menu
        ContextualGUI.edgeCategories = kinds.split(',')
        ContextualGUI.addCheckboxes("Categories", ContextualGUI.edgeCategories)
            //console.log('contextual menu initialized');
    }

    /**
     * Init from collection of strings
     * @param {*} collection collection of strings
     */
    static init2(collection) {
        if (ContextualGUI.edgeMenu && ContextualGUI.edgeMenu._content) {
            ContextualGUI.edgeMenu.destroy();
        }

        // Create Contextual GUI
        ContextualGUI.createEdgeMenu();
        ContextualGUI.addCheckboxes("Categories", collection)
            //console.log('contextual menu re-initialized');
    }

    static createEdgeMenu() {
        ContextualGUI.edgeMenu = QuickSettings.create(gp5.width - 240, gp5.height - 240, 'Edge Menu', document.getElementById('model'));

        // Switch it off is the checkbox is off
        if (!DOM.checkboxes.edit.checked) {
            ContextualGUI.edgeMenu.toggleVisibility();
        }
    }

    static addCheckboxes(label, items) {
        // the callback here is used when a new option is chosen
        ContextualGUI.edgeMenu.addDropDown(label, items, (val) => {
            ContextualGUI.edgeMenuChoice = val.value;
            ContextualGUI.notifyObservers(val.value);
        });
        // get the value of first selected item in the dropdown at the moment of adding new checkboxes
        let tmp = ContextualGUI.edgeMenu._controls.Categories.control.value;
        ContextualGUI.notifyObservers(tmp);
        ContextualGUI.edgeMenuChoice = tmp;
    }

    static getValue(val) {
        ContextualGUI._edgeMenuValue = val.value;
        console.log('value changed');
    }

    static setEdgeMenuValue(val) {
        ContextualGUI._edgeMenuValue = val;
    }

    static addEdgeCategory(cat) {
        let rtn = false;
        if (!ContextualGUI.edgeCategories.includes(cat)) {
            ContextualGUI.edgeCategories.push(cat)
            rtn = true;
        }
        return rtn;
    }

}
ContextualGUI.edgeMenu;
ContextualGUI.observers = [];
ContextualGUI.edgeCategories = [];
ContextualGUI.edgeMenuChoice;