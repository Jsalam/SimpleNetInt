"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterSettings = void 0;
const canvas_1 = require("../../canvas/canvas");
const colorFactory_1 = require("../../factories/colorFactory");
const vGeoCluster_1 = require("../../visualElements/vGeoCluster");
const DOMUtils_1 = require("../ContextualGUIs/DOMUtils");
/**
 * GUI widget for controlling cluster settings such as dimension, time, zoom direction, and color transform.
 * It provides a graphic user interface for interacting with VCluster instances and Sorting Lists.
 *
 * The updateVCluster boolean parameter creates a menu on the left side of the screen with controls for each VCluster added.
 */
class ClusterSettings {
    vCluster;
    root;
    levels;
    dimensionViewModels = [];
    dimensionControls = [];
    timeControl;
    /**
     *
     * @param vCluster the vCluster to be used to extract its attributes into a menu
     * @param updateVCluster A boolean variable that defines whether user selections change the visualization of vClusters or not.
     * This is very useful to control alternative visualizations of vNodes as in the case of sorting lists.
     */
    constructor(vCluster, updateVCluster) {
        this.vCluster = vCluster;
        this.levels = this.getDepth(vCluster.cluster.dimensions);
        if (vCluster.cluster.type == "geo")
            this.levels -= 1;
        this.dimensionViewModels = this.makeDimensionControlViewModels();
        this.dimensionControls = this.makeDimensionControls("CSSelect", updateVCluster);
        this.timeControl = this.makeTimeControl("CSSelect", this.yearDataListener(updateVCluster));
        if (updateVCluster) {
            this.root = this.makeElementsForVClusterUpdate(vCluster);
        }
        else {
            this.root = this.makeElementsForSortingList();
        }
        for (let i = 0; i < this.levels; ++i) {
            this.syncDimensionControl(i);
        }
        if (updateVCluster) {
            this.updateDimension();
            this.updateTimestamp();
        }
    }
    /*  Public methods */
    /**
     * Builds and returns a settings panel DOM container for updating a VCluster's visual properties.
     *
     * The returned container includes:
     * - A title row with the vCluster label and a visibility checkbox bound to the instance's vCluster,
     *   allowing users to toggle the cluster's visibility.
     * - A "Dimension" control row containing the dimension select elements (this.dimensionControls).
     * - A "Year Data" control row containing the time select element (this.timeControl).
     * - A "Zoom Direction" control row containing a select element (created with makeZoomDirectionControl).
     * - A "Color Transform" control row containing a select element (created with makeColorTransformControl).
     * - A horizontal rule separator.
     *
     * Each control uses the instance's existing helper methods to create selects and bind event listeners,
     * so interacting with the returned controls will update the associated VCluster (palette, timestamp,
     * bottomTierDimension, zoom direction, color transform) and trigger Canvas updates where applicable.
     *
     * Note: This method only creates and returns the element; it does not attach it to the document.
     *
     * @param vCluster - The VCluster whose label is displayed in the title and whose related data is used
     *                   for constructing the controls. This is the cluster the UI will represent.
     * @returns The root HTMLElement container for the VCluster settings controls.
     *
     * @remarks
     * - The element classes used (e.g., 'CSContainer', 'CSControl') are applied to the produced container
     *   and child controls for UI styling.
     * - Any select elements returned are expected to have their change handlers configured by other methods
     *   (dimListener, yearDataListener, zoomControlListener, colorTransformListener) invoked during
     *   construction of this ClusterSettings instance.
     */
    makeElementsForVClusterUpdate(vCluster) {
        if (vCluster instanceof vGeoCluster_1.VGeoCluster) {
            return this.makeContainer("CSContainer", this.makeTitle(vCluster.cluster.label, "CSTitle"), this.makeControl("Dimension", "CSControl", ...this.dimensionControls), this.makeControl("Period", "CSControl selectElementFlex", this.timeControl), this.makeControl("Zoom Direction", "CSControl selectElementFlex", this.makeZoomDirectionControl("CSDropSelect")), this.makeControl("Color Transform", "CSControl selectElementFlex", this.makeColorTransformControl("CSDropSelect")), (0, DOMUtils_1.createElement)("hr", { border: "1px solid rgba(110, 117, 124)" }));
        }
        else {
            return this.makeContainer("CSContainer", this.makeTitle(vCluster.cluster.label, "CSTitle"), this.makeControl("Dimension", "CSControl", ...this.dimensionControls), this.makeControl("Zoom Direction", "CSControl selectElementFlex", this.makeZoomDirectionControl("CSDropSelect")), this.makeControl("Color Transform", "CSControl selectElementFlex", this.makeColorTransformControl("CSDropSelect")), (0, DOMUtils_1.createElement)("hr", { border: "1px solid rgba(110, 117, 124)" }));
        }
    }
    /**
     * Creates a compact settings container used for displaying cluster controls in a "sorting list" mode.
     *
     * The returned element contains:
     * - A compact dimension controls row (no visible label) comprised of the internal dimension select elements
     *   (this.dimensionControls).
     * - A time select element (this.timeControl) placed alongside the dimension controls for selecting the active timestamp.
     *
     * This method is intended for cases where the UI should present a compact control layout for sorting or
     * quick inspection rather than full VCluster visual updates. The created controls are the same selects that
     * are wired up by the instance (including their onchange handlers), but when this method is used typically the
     * ClusterSettings instance has been constructed with updateVCluster = false, so changes will not alter the
     * vCluster's visualization (they are commonly used by a sorting mechanism instead).
     *
     * The returned HTMLElement is not attached to the DOM; callers should insert it where needed.
     *
     * @returns An HTMLElement (container) with the compact sorting list controls applied with classes:
     *          - Container: 'CSContainer'
     *          - Control row: 'CSControl CSSelect'
     */
    makeElementsForSortingList() {
        let tmp = this.makeControl("", "CSControl CSSelect", ...this.dimensionControls);
        tmp.appendChild(this.timeControl);
        return this.makeContainer("CSContainer", tmp);
    }
    // public getCurrentSelection(): Map<string, string> | void {
    //   let cs: Map<string, string> = new Map;
    //   // this for loop prints out al the enabled labels of the dimension hierarchy.
    //   for (let i = 0; i < this.levels; i++) {
    //     cs.set(this.dimensionControls[i].name, this.dimensionControls[i].value);
    //   }
    //   // console.log(selectionHierarchy)
    //   return cs;
    // }
    getVCluster() {
        return this.vCluster;
    }
    getDimensionControls() {
        return this.dimensionControls;
    }
    getYearControl() {
        return this.timeControl;
    }
    /** Returns a map with <key, value> pairs of the dimension.
     * The key is the name of the HTML selector and the value is the current selection.
     * The keys (names of HTML elements) are assigned once the JSON data is read to make each HTML element.
     * See DOM.createSelectElement
     */
    getDimensionMap() {
        let dimensionsMap = new Map();
        for (let i = 0; i < this.levels; i++) {
            dimensionsMap.set(this.dimensionControls[i].name, this.dimensionControls[i].value);
        }
        return dimensionsMap;
    }
    getDimensionArray() {
        return [...this.getDimensionMap()];
    }
    /*  Private methods  */
    getDepth(dimension) {
        if ("key" in dimension)
            return 1;
        return (Math.max(0, ...dimension.children.map((dim) => this.getDepth(dim))) +
            1);
    }
    makeContainer(className, ...children) {
        return (0, DOMUtils_1.createElement)("div", null, className, null, ...children);
    }
    makeTitle(title, className) {
        return (0, DOMUtils_1.createElement)("div", null, className, null, (0, DOMUtils_1.createElement)("label", null, null, null, title), (0, DOMUtils_1.createInputElement)({ marginLeft: "10px", fontSize: "1em" }, {
            type: "checkbox",
            checked: true,
            onclick: (e) => {
                this.vCluster.visible = e.target.checked;
                // TODO: refactor this logic
                vGeoCluster_1.VGeoCluster.visible = vGeoCluster_1.VGeoCluster.all.filter((cluster) => cluster.visible);
            },
        }));
    }
    makeInputLabel(text) {
        return (0, DOMUtils_1.createElement)("div", null, null, null, text);
    }
    makeControl(label, className, ...controls) {
        let tmp = (0, DOMUtils_1.createElement)("div", null, className, null, this.makeInputLabel(label), ...controls);
        return tmp;
    }
    makeSelectElement(options, properties, className, name) {
        return (0, DOMUtils_1.createSelectElement)(options, null, className, properties, name);
    }
    makeTimeControl(className, timeProps) {
        let tmp = this.makeSelectElement(this.vCluster.cluster.timestamps.map((t) => ({ name: t, value: t })), timeProps, className);
        return tmp;
    }
    makeDimensionControlViewModels() {
        const viewModels = [];
        let cur = this.vCluster.cluster.dimensions;
        while (cur && "children" in cur) {
            viewModels.push(cur);
            cur = cur.children[0];
        }
        return viewModels;
    }
    makeDimensionControls(className, updateVCluster) {
        const controls = [];
        for (let i = 0; i < this.levels; ++i) {
            controls.push(this.makeSelectElement([], this.dimListener(i, updateVCluster), className, String(i)));
        }
        return controls;
    }
    /**
     * This function populates the control with the options and adds the name to the select element.
     * @param i the element index in the control.
     */
    syncDimensionControl(i) {
        const dimensioNameFromJSON = this.vCluster.cluster.dimensions.name;
        if (i == 0) {
            (0, DOMUtils_1.updateSelectOptions)(this.dimensionControls[i], this.dimensionViewModels[i].children.map((dim) => ({
                name: dim.name,
                value: "key" in dim ? dim.key : dim.name,
            })), dimensioNameFromJSON);
        }
        else {
            (0, DOMUtils_1.updateSelectOptions)(this.dimensionControls[i], this.dimensionViewModels[i].children.map((dim) => ({
                name: dim.name,
                value: "key" in dim ? dim.key : dim.name,
            })), "option" + i);
        }
    }
    makeZoomDirectionControl(className) {
        return (0, DOMUtils_1.createSelectElement)([
            {
                name: "in",
                value: "1",
            },
            {
                name: "out",
                value: "-1",
            },
            {
                name: "hold",
                value: "0",
            },
        ], null, className, this.zoomControlListener());
    }
    makeColorTransformControl(className) {
        return (0, DOMUtils_1.createSelectElement)([
            {
                name: "linear",
                value: "linear",
            },
            {
                name: "log",
                value: "log",
            },
            {
                name: "sqrt",
                value: "sqrt",
            },
        ], null, className, this.colorTransformListener());
    }
    onDimensionSelect(index, updateVCluster) {
        if (index < this.levels - 1) {
            this.dimensionViewModels[index + 1] = this.dimensionViewModels[index].children.find((dim) => dim.name === this.dimensionControls[index].value);
            for (let i = index + 2; i < this.levels; ++i) {
                this.dimensionViewModels[i] = this.dimensionViewModels[i - 1]
                    .children[0];
            }
            for (let i = index + 1; i < this.levels; ++i) {
                this.syncDimensionControl(i);
            }
        }
        if (updateVCluster)
            this.updateDimension();
        return this.getDimensionMap();
    }
    updateDimension() {
        if (this.levels == 0)
            return;
        let dimensions = [];
        for (let i = 0; i < this.levels; i++) {
            dimensions.push(this.dimensionControls[i].value);
        }
        this.vCluster.updateDimensions(dimensions);
        this.vCluster.updatePalette();
        canvas_1.Canvas.update();
    }
    updateTimestamp() {
        this.vCluster.timestamp = this.timeControl.value;
        this.vCluster.updatePalette();
        canvas_1.Canvas.update();
    }
    //***** EVENT PROPERTIES */
    yearDataListener(bol) {
        return {
            onchange: (e) => {
                if (bol) {
                    this.updateTimestamp();
                }
                // use currentTarget if possible — it's the element the handler is attached to
                const el = (e.currentTarget ?? e.target);
                el?.blur();
            },
        };
    }
    dimListener(index, updateVCluster) {
        return {
            onchange: (e) => {
                this.onDimensionSelect(index, updateVCluster);
                e.target.blur();
            },
        };
    }
    colorTransformListener() {
        return {
            onchange: (e) => {
                if (this.vCluster instanceof vGeoCluster_1.VGeoCluster) {
                    // TODO: refactor this
                    const value = e.target
                        .value;
                    switch (value) {
                        case "log":
                            this.vCluster.scalarTransform = colorFactory_1.ColorFactory.scalarTransforms.log;
                            break;
                        case "sqrt":
                            this.vCluster.scalarTransform =
                                colorFactory_1.ColorFactory.scalarTransforms.sqrt;
                            break;
                        default:
                            this.vCluster.scalarTransform =
                                colorFactory_1.ColorFactory.scalarTransforms.linear;
                            break;
                    }
                }
                this.vCluster.updatePalette();
                canvas_1.Canvas.update();
            },
        };
    }
    zoomControlListener() {
        return {
            onchange: (e) => {
                if (this.vCluster instanceof vGeoCluster_1.VGeoCluster) {
                    this.vCluster.zoomDirection = Number(e.target.value);
                }
            },
        };
    }
}
exports.ClusterSettings = ClusterSettings;
// Attach ClusterFactory to the global window object
window.ClusterSettings = ClusterSettings;
//# sourceMappingURL=ClusterSettings.js.map