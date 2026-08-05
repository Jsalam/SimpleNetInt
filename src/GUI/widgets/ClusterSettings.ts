import { Canvas } from "../../canvas/canvas";
import { DimensionCategory, DimensionID } from "../../types";
import { ColorFactory } from "../../factories/colorFactory";
import { VCluster } from "../../visualElements/vCluster";
import { VGeoCluster } from "../../visualElements/vGeoCluster";
import { createElement, createInputElement, createSelectElement, updateSelectOptions } from "../DOM/DOMUtils";
import { Mapper } from "../../utilities/mapper";
/**
 * GUI widget for controlling cluster settings such as dimension, time, zoom direction, and color transform.
 * It provides a graphic user interface for interacting with VCluster instances and Sorting Lists.
 *
 * The updateVCluster boolean parameter creates a menu on the left side of the screen with controls for each VCluster added.
 */

export class ClusterSettings {
  root: HTMLElement;
  private levels: number;
  private dimensionViewModels: DimensionCategory[] = [];
  private dimensionControls: HTMLSelectElement[] = [];
  private timeControl: HTMLSelectElement;
  private colorControls: HTMLElement[] = [];

  /**
   *
   * @param vCluster the vCluster to be used to extract its attributes into a menu
   * @param updateVCluster A boolean variable that defines whether user selections change the visualization of vClusters or not.
   * This is very useful to control alternative visualizations of vNodes as in the case of sorting lists.
   */
  constructor(
    private vCluster: VCluster,
    updateVCluster: boolean,
  ) {
    this.levels = this.getDepth(vCluster.cluster.dimensions);

    if (vCluster.cluster.type == "geo" || vCluster.cluster.type == 'carto') this.levels -= 1;

    this.dimensionViewModels = this.makeDimensionControlViewModels();
    this.dimensionControls = this.makeDimensionControls("CSSelect", updateVCluster);
    this.timeControl = this.makeTimeControl("CSSelect", this.yearDataListener(updateVCluster));
    this.colorControls = this.makeColorControls("CSControl selectElementFlex", updateVCluster);

    if (updateVCluster) {
      this.root = this.makeElementsForVClusterUpdate(vCluster);
    } else {
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
  public makeElementsForVClusterUpdate(vCluster: VCluster) {
     if (vCluster instanceof VGeoCluster) {
    return this.makeContainer("CSContainer", this.makeTitle(vCluster.cluster.label!, "CSTitle"), this.makeControl("Dimension", "CSControl", ...this.dimensionControls), this.makeControl("Period", "CSControl selectElementFlex", this.timeControl), this.makeControl("Zoom Direction", "CSControl selectElementFlex", this.makeZoomDirectionControl("CSDropSelect")), this.makeControl("Color", "CSControl", ...this.colorControls), createElement("hr", { border: "1px solid rgba(110, 117, 124)" }));
    } else {
      return this.makeContainer(
        "CSContainer",
        this.makeTitle(vCluster.cluster.label!, "CSTitle"),
        this.makeControl("Zoom Direction", "CSControl selectElementFlex", this.makeZoomDirectionControl("CSDropSelect")),
        this.makeControl("Color", "CSControl", ...this.colorControls),
        createElement("hr", { border: "1px solid rgba(110, 117, 124)" }));
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
  public makeElementsForSortingList() {
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

  public getVCluster(): VCluster {
    return this.vCluster;
  }

  public getDimensionControls() {
    return this.dimensionControls;
  }

  public getYearControl() {
    return this.timeControl;
  }

  public getLevels() {
    return this.levels;
  }

  /** Returns a map with <key, value> pairs of the dimension.
   * The key is the name of the HTML selector and the value is the current selection.
   * The keys (names of HTML elements) are assigned once the JSON data is read to make each HTML element.
   * See DOM.createSelectElement
   */
  public getDimensionMap(): Map<string, string> {
    let dimensionsMap: Map<string, string> = new Map();

    for (let i = 0; i < this.levels; i++) {
      dimensionsMap.set(this.dimensionControls[i].name, this.dimensionControls[i].value);
    }

    return dimensionsMap;
  }

  public getCurrentDimensionArray(): [string, string][] {
    return [...this.getDimensionMap()];
  }

  /**
   * TODO: Generalize this function for any dataset hierarchy
   *
   * Build a parameter object from the current UI dimension selections.
   * CURRENTLY CUSTOMIZED FOR COLOMBIA ELECTIONS DATASET
   * JULY 24, 2026
   *
   * The returned object contains keys used to filter and retrieve data from
   * the selected dimension hierarchy and the current year/time control.
   *
   * @returns A record with attrAllKey, filteringKey, filteringValue, and variableKey,
   *          or undefined if the current settings are not available.
   */
  public getCurrentDimensionParameters(): Record<string, string> | undefined {
    const params: Record<string, string> = {};
    const currentSettings: string[][] | undefined = this.getCurrentDimensionArray();
    const periodParams: string | undefined = this.getYearControl().value;

    if (!currentSettings || !periodParams) return;

    // this is the key name to filter the attributes under the top level "atAll"
    params["attrAllKey"] = periodParams;

    // this is the key name to filter the entries result of applying the previous filter
    params["filteringKey"] = currentSettings[0][0];

    // this is the value we are looking for asigned to the key above
    params["filteringValue"] = currentSettings[this.levels! - 2][1];

    // this is the key name that stores the value we are looking for
    params["variableKey"] = currentSettings[this.levels! - 1][1];

    return params;
  }

  /*  Private methods  */

  private getDepth(dimension: DimensionCategory): number {
    if ("key" in dimension) return 1;
    return Math.max(0, ...dimension.children.map((dim: any) => this.getDepth(dim))) + 1;
  }

  private makeContainer(className: string, ...children: HTMLElement[]) {
    return createElement("div", null, className, null, ...children);
  }

  private makeTitle(title: string, className: string): HTMLElement {
    return createElement(
      "div",
      null,
      className,
      null,
      createElement("label", null, null, null, title),
      createInputElement(
        { marginLeft: "10px", fontSize: "1em" },
        {
          type: "checkbox",
          checked: true,
          onclick: (e) => {
            this.vCluster.visible = (e.target as HTMLInputElement).checked;
            // TODO: refactor this logic
            VGeoCluster.visible = VGeoCluster.all.filter((cluster) => cluster.visible);
          },
        },
      ),
    );
  }

  private makeInputLabel(text: string): HTMLElement {
    return createElement("div", null, null, null, text);
  }

  /**
   * Create a labeled control wrapper.
   * @param label Text shown next to the control elements.
   * @param className Optional class name for the wrapper container.
   * @param controls One or more control elements to include. These are generathed by tother methods like makeSelectElement()
   * @returns HTMLElement containing the label and controls.
   */
  private makeControl(label: string, className: string | null, ...controls: HTMLElement[]): HTMLElement {
    let tmp = createElement("div", null, className, null, this.makeInputLabel(label), ...controls);
    return tmp;
  }

  /**
   * Create a select element for the cluster settings UI.
   * @param options Array of option objects with display name and value.
   * @param properties Optional HTMLSelectElement properties to apply.
   * @param className Optional CSS class name for the select element.
   * @param name Optional name attribute for the select element.
   * @returns A configured HTMLSelectElement.
   */
  private makeSelectElement(options: Array<{ name: string; value: string }>, properties?: Partial<HTMLSelectElement> | null, className?: string, name?: string) {
    return createSelectElement(options, null, className, properties, name);
  }

  private makeTimeControl(className: string, timeProps: Partial<HTMLSelectElement>): HTMLSelectElement {
    let tmp = this.makeSelectElement(
      this.vCluster.cluster.timestamps.map((t) => ({ name: t, value: t })),
      timeProps,
      className,
    );
    return tmp;
  }

  /**
   * Build a list of dimension view models for the chained dimension selectors.
   *
   * A dimension view model here is a representation built from the dimensions node loaded from 
   * the JSON file that can be used to populate one of the hierarchical dimension selection 
   * controls. Each node in the model contains the children used for the next level of selector 
   * options.
   *
   * The method walks down the first child of each category starting from the
   * top-level cluster dimensions, collecting the nodes along the path.
   * This provides the ordered view models for each selector level.
   *
   * @returns Array of DimensionCategory nodes used for dimension selection UI.
   */
  private makeDimensionControlViewModels(): DimensionCategory[] {
    const viewModels: DimensionCategory[] = [];
    let cur: DimensionCategory = this.vCluster.cluster.dimensions;
    while (cur && "children" in cur) {
      viewModels.push(cur);
      cur = cur.children[0];
    }

    return viewModels;
  }

  private makeDimensionControls(className: string, updateVCluster: boolean) {
    const controls: HTMLSelectElement[] = [];
    for (let i = 0; i < this.levels; ++i) {
      controls.push(this.makeSelectElement([], this.dimListener(i, updateVCluster), className, String(i)));
    }
    return controls;
  }

  private makeColorControls(className: string, updateVCluster: boolean) {
    const transformControl = this.makeControl("Transform", className, this.makeColorTransformControl("CSDropSelect"));
    const domainControl = this.makeControl("Domain", className, this.makeColorDomainControl("CSDropSelect"));
    return [transformControl, domainControl];
  }

  /**
   * This function populates the control with the options and adds the name to the select element.
   * @param i the element index in the control.
   */
  private syncDimensionControl(i: number) {
    const dimensioNameFromJSON = this.vCluster.cluster.dimensions.name;
    if (i == 0) {
      updateSelectOptions(
        this.dimensionControls[i],
        this.dimensionViewModels[i].children.map((dim) => ({
          name: dim.name,
          value: "key" in dim ? dim.key : dim.name,
        })),
        dimensioNameFromJSON, // dimensionName,
      );
    } else {
      updateSelectOptions(
        this.dimensionControls[i],
        this.dimensionViewModels[i].children.map((dim) => ({
          name: dim.name,
          value: "key" in dim ? dim.key : dim.name,
        })),
        "option" + i, // dimensionName,
      );
    }
  }

  private makeZoomDirectionControl(className: string) {
    return createSelectElement(
      [
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
      ],
      null,
      className,
      this.zoomControlListener(),
    );
  }

  private makeColorTransformControl(className: string) {
    let transformsNames = Object.keys(Mapper.scalarTransforms);
    let arrayOfNames = [];
    for (let i = 0; i < transformsNames.length; i++) {
      const element = { name: transformsNames[i], value: transformsNames[i] };
      arrayOfNames.push(element);
    }
    let rtn = createSelectElement(arrayOfNames, null, className, this.colorTransformListener(), "colorTransform");
    rtn.id = "colorTransform";
    return rtn;
  }

  private makeColorDomainControl(className: string) {
    let rtn = createSelectElement(
      [
        {
          name: "absolute",
          value: "absolute",
        },
        {
          name: "relative",
          value: "relative",
        },
      ],
      null,
      className,
      this.colorDomainListener(),
      "colorDomain",
    );
    rtn.id = "colorDomain";
    return rtn;
  }

  private onDimensionSelect(index: number, updateVCluster: boolean): Map<string, string> {
    if (index < this.levels - 1) {
      this.dimensionViewModels[index + 1] = this.dimensionViewModels[index].children.find((dim) => dim.name === this.dimensionControls[index].value) as DimensionCategory;

      for (let i = index + 2; i < this.levels; ++i) {
        this.dimensionViewModels[i] = this.dimensionViewModels[i - 1].children[0] as DimensionCategory;
      }

      for (let i = index + 1; i < this.levels; ++i) {
        this.syncDimensionControl(i);
      }
    }

    if (updateVCluster) this.updateDimension();

    return this.getDimensionMap();
  }

  private updateDimension() {
    if (this.levels == 0) return;

    let dimensions: string[] = [];

    for (let i = 0; i < this.levels; i++) {
      dimensions.push(this.dimensionControls[i].value);
    }

    this.vCluster.updateDimensions(dimensions);
    this.vCluster.updateLegendAndPalette();
    Canvas.update();
  }

  private updateTimestamp() {
    this.vCluster.timestamp = this.timeControl.value;
    this.vCluster.updateLegendAndPalette();
    Canvas.update();
  }

  //***** EVENT PROPERTIES */

  private yearDataListener(bol: boolean): Partial<HTMLSelectElement> {
    return {
      onchange: (e: Event) => {
        if (bol) {
          this.updateTimestamp();
        }
        // use currentTarget if possible — it's the element the handler is attached to
        const el = (e.currentTarget ?? e.target) as HTMLSelectElement | null;
        el?.blur();
      },
    };
  }

  private dimListener(index: number, updateVCluster: boolean): Partial<HTMLSelectElement> {
    return {
      onchange: (e) => {
        this.onDimensionSelect(index, updateVCluster);
        (e.target as HTMLSelectElement).blur();
      },
    };
  }

  private colorTransformListener(): Partial<HTMLSelectElement> {
    return {
      onchange: (e) => {
        this.vCluster.updateLegendAndPalette(e);
        Canvas.update();
      },
    };
  }

  private colorDomainListener(): Partial<HTMLSelectElement> {
    return {
      onchange: (e: Event) => {
        this.vCluster.updateLegendAndPalette(e);
        Canvas.update();
      },
    };
  }

  private zoomControlListener(): Partial<HTMLSelectElement> {
    return {
      onchange: (e) => {
        if (this.vCluster instanceof VGeoCluster) {
          this.vCluster.zoomDirection = Number((e.target as HTMLSelectElement).value);
        }
      },
    };
  }
}
// Attach ClusterFactory to the global window object
(window as any).ClusterSettings = ClusterSettings;
