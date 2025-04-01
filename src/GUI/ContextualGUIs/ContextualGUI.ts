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
            ContextualGUI.edgeCategories = [];
        }

        // Create Contextual GUIs edges
        ContextualGUI.createEdgeMenu();

        // Create Contextual GUI spaces
        ContextualGUI.createSpacesMenu();

        // populate contextual menu
        if (kinds instanceof Array)
            ContextualGUI.edgeCategories = kinds
        else
            ContextualGUI.edgeCategories = kinds.split(',')
        ContextualGUI.addEdgeCheckboxes("Categories", ContextualGUI.edgeCategories)

    }

    /**
     * Init from collection of strings
     * @param {*} collection collection of strings
     */
    static init2(collection) {
        if (ContextualGUI.edgeMenu && ContextualGUI.edgeMenu._content) {
            ContextualGUI.edgeMenu.destroy();
        }

        // Create Contextual GUI edges
        ContextualGUI.createEdgeMenu();
        ContextualGUI.addEdgeCheckboxes("Categories", collection);
    }

    /**
     * The menu to choose edge kinds
     */
    static createEdgeMenu() {
        ContextualGUI.edgeMenu = QuickSettings.create(gp5.width - 240, gp5.height - 240, 'Edge Menu', document.getElementById('model'));

        // Switch it off is the checkbox is off
        if (!DOM.checkboxes.edit.checked) {
            ContextualGUI.edgeMenu.toggleVisibility();
        }
    }

    /**
     * The menu to toggle individual transformation spaces
     */
    static createSpacesMenu() {

        // Check first if this already exists
        if (!ContextualGUI.spacesMenu) {
            ContextualGUI.spacesMenu = QuickSettings.create(gp5.width - 540, gp5.height - 240, 'Spaces Menu', document.getElementById('model'));
        } else {
            ContextualGUI.clearFloatingMenu(ContextualGUI.spacesMenu);
        }
        //Switch it off is the checkbox is off
        if (!DOM.checkboxes.spacesMenu.checked) {
            ContextualGUI.spacesMenu.toggleVisibility();
        }
    }

    static addEdgeCheckboxes(label, items) {
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

    static clearFloatingMenu(menu) {
        let controls = Object.entries(menu._controls)
        for (let i = controls.length; i > 0; i--) {
            let controlName = controls[i - 1][0];
            menu.removeControl(controlName);
        }
    }

}
ContextualGUI.edgeMenu;
ContextualGUI.spacesMenu;
ContextualGUI.observers = [];
ContextualGUI.edgeCategories = [];
ContextualGUI.edgeMenuChoice;