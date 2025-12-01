import { Canvas } from "../../canvas/canvas";
import { DimensionCategory, Dimensions } from "../../factories/clusterFactory";
import { VCluster } from "../../visualElements/vCluster";
import { VGeoCluster } from "../../visualElements/vGeoCluster";
import {
  createElement,
  createInputElement,
  createSelectElement,
  updateSelectOptions,
} from "../ContextualGUIs/DOMUtils";

/**
 * GUI widget for controlling cluster settings such as dimension, time, zoom direction, and color transform.
 * It provides a user interface for interacting with VCluster instances and Sorting Lists.
 * 
 * The updateVCluster boolean parameter creates a menu on the left side of the screen with controls for each VCluster added.
 */


export class ClusterSettings {

  root: HTMLElement;
  private levels: number;
  private dimensionViewModels: DimensionCategory[] = [];
  private dimensionControls: HTMLSelectElement[] = [];
  private timeControl: HTMLSelectElement;

  /**
   * 
   * @param vCluster the vCluster to be used to extract its attributes into a menu 
   * @param updateVCluster A boolean variable that defines wether user selections change the visualization of vClusters or not. 
   * This is very useful to control alternative visualizations of vNodes as in the case of sorting lists.
   */
  constructor(private vCluster: VCluster, updateVCluster: boolean) {
    this.levels = this.getDepth(vCluster.cluster.dimensions) - 1;

    this.dimensionViewModels = this.makeDimensionControlViewModels();
    this.dimensionControls = this.makeDimensionControls("CSSelect", updateVCluster);
    this.timeControl = this.makeTimeControl("CSSelect", this.yearDataListener(updateVCluster));

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
   * dimension, zoom direction, color transform) and trigger Canvas updates where applicable.
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
    return this.makeContainer('CSContainer',
      this.makeTitle(vCluster.cluster.label!, 'CSTitle'),
      this.makeControl("Dimension", 'CSControl', ...this.dimensionControls),
      this.makeControl("Year Data", 'CSControl selectElementFlex', this.timeControl),
      this.makeControl("Zoom Direction", 'CSControl selectElementFlex', this.makeZoomDirectionControl('CSDropSelect')),
      this.makeControl("Color Transform", 'CSControl selectElementFlex', this.makeColorTransformControl('CSDropSelect')),
      createElement("hr", { border: "1px solid rgba(110, 117, 124)" }),
    );

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
    let tmp = this.makeControl("", 'CSControl CSSelect', ...this.dimensionControls);
    tmp.appendChild(this.timeControl)
    return this.makeContainer('CSContainer', tmp)
  }

  public getCurrentSelection():string[]|void {
    let selectionHierarchy: string[] = [];
    // this for prints out al the enabled labels of the dimension hierarchy.  
    for (let i = 0; i < this.levels; i++) {
      selectionHierarchy.push(this.dimensionControls[i].value)
    }
   // console.log(selectionHierarchy)
    return selectionHierarchy;
  }

  public getDimensionControls(){
    return this.dimensionControls;
  }

  public getYearControl(){
    return this.timeControl;
  }

  /*  Private methods  */

  private getDepth(dimension: Dimensions): number {
    if ("key" in dimension) return 1;
    return (
      Math.max(0, ...dimension.children.map((dim) => this.getDepth(dim))) + 1
    );
  }

  private makeContainer(className: string, ...children: HTMLElement[]) {
    return createElement("div", null, className, null, ...children,);
  }

  private makeTitle(title: string, className: string): HTMLElement {
    return createElement("div",
      null,
      className,
      null,
      createElement("label", null, null, null, title,),
      createInputElement({ marginLeft: "10px", fontSize: "1em" }, {
        type: "checkbox",
        checked: true,
        onclick: (e) => {
          this.vCluster.visible = (e.target as HTMLInputElement).checked;
          // TODO: refactor this logic
          VGeoCluster.visible = VGeoCluster.all.filter(
            (cluster) => cluster.visible,
          );
        },
      }),
    );
  }

  private makeInputLabel(text: string): HTMLElement {
    return createElement(
      "div", null, null, null, text,
    );
  }

  private makeControl(label: string, className: string | null, ...controls: HTMLElement[]): HTMLElement {
    let tmp = createElement("div", null, className, null, this.makeInputLabel(label), ...controls);
    return tmp;
  }

  private makeSelectElement(
    options: Array<{ name: string; value: string }>,
    properties?: Partial<HTMLSelectElement> | null,
    className?: string
  ) {
    return createSelectElement(options, null, className, properties);
  }

  private makeTimeControl(className: string, timeProps: Partial<HTMLSelectElement>): HTMLSelectElement {
    let tmp = this.makeSelectElement(
      this.vCluster.cluster.timestamps.map((t) => ({ name: t, value: t, })),
      timeProps,
      className
    );
    return tmp
  }

  private makeDimensionControlViewModels(): DimensionCategory[] {
    const viewModels: DimensionCategory[] = [];
    let cur: Dimensions = this.vCluster.cluster.dimensions;
    while (cur && "children" in cur) {
      viewModels.push(cur);
      cur = cur.children[0];
    }
    return viewModels;

  }

  private makeDimensionControls(className: string, updateVCluster: boolean) {
    const controls: HTMLSelectElement[] = [];
    for (let i = 0; i < this.levels; ++i) {
      controls.push(
        this.makeSelectElement([], this.dimListener(i, updateVCluster), className),
      );
    }
    return controls;
  }

  private syncDimensionControl(i: number) {
    updateSelectOptions(
      this.dimensionControls[i],
      this.dimensionViewModels[i].children.map((dim) => ({
        name: dim.name,
        value: "key" in dim ? dim.key : dim.name,
      })),
    );
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
      ],
      null, className,
      this.zoomControlListener()
    );
  }

  private makeColorTransformControl(className: string) {
    return createSelectElement(
      [
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
      ],
      null, className,
      this.colorTransformListener()
    );
  }

  private onDimensionSelect(index: number, updateVCluster: boolean): string[]|void {
    if (index < this.levels - 1) {
      this.dimensionViewModels[index + 1] = this.dimensionViewModels[index].children.find(
        (dim) => dim.name === this.dimensionControls[index].value,
      ) as DimensionCategory;

      for (let i = index + 2; i < this.levels; ++i) {
        this.dimensionViewModels[i] = this.dimensionViewModels[i - 1].children[0] as DimensionCategory;
      }

      for (let i = index + 1; i < this.levels; ++i) {
        this.syncDimensionControl(i);
      }
    }

    if (updateVCluster) this.updateDimension();

    return this.getCurrentSelection();
  }

  private updateDimension() {
    if (this.levels == 0) return;
    this.vCluster.dimension = this.dimensionControls[this.levels - 1].value;
    this.vCluster.updatePalette();
    Canvas.update();
  }

  private updateTimestamp() {
    this.vCluster.timestamp = this.timeControl.value;
    this.vCluster.updatePalette();
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
    }
  }

  private colorTransformListener(): Partial<HTMLSelectElement> {
    return {
      onchange: (e) => {
        if (this.vCluster instanceof VGeoCluster) {
          // TODO: refactor this
          const value = (e.target as HTMLSelectElement)
            .value as keyof typeof VGeoCluster.scalarTransforms;
          switch (value) {
            case "log":
              this.vCluster.scalarTransform =
                VGeoCluster.scalarTransforms.log;
              break;
            case "sqrt":
              this.vCluster.scalarTransform =
                VGeoCluster.scalarTransforms.sqrt;
              break;
            default:
              this.vCluster.scalarTransform =
                VGeoCluster.scalarTransforms.linear;
              break;
          }
        }
        this.vCluster.updatePalette();
        Canvas.update();
      }
    }
  }

  private zoomControlListener(): Partial<HTMLSelectElement> {
    return {
      onchange: (e) => {
        if (this.vCluster instanceof VGeoCluster) {
          this.vCluster.zoomDirection = Number(
            (e.target as HTMLSelectElement).value,
          );
        }
      },
    }
  }
}
// Attach ClusterFactory to the global window object
(window as any).ClusterSettings = ClusterSettings;
