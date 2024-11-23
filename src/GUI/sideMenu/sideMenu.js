class SideMenu {
    constructor(parent) { 
        this.parent = parent;
    }

    addCheckboxes(names){
        DOM.createCheckboxFor(names, this.parent)
    }
}