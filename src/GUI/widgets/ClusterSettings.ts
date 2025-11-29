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
 * It provides a user interface for interacting with VCluster instances.
 * 
 * It creates a menu on the left side of the screen with controls for each VCluster added.
 */

export class ClusterSettings {

  root: HTMLElement;
  private levels: number;
  private dimensionViewModels: DimensionCategory[] = [];
  private dimensionControls: HTMLSelectElement[] = [];
  private timeControl: HTMLSelectElement;

  constructor(private vCluster: VCluster) {
    this.levels = this.getDepth(vCluster.cluster.dimensions) - 1;

    this.dimensionViewModels = this.makeDimensionControlViewModels();
    this.dimensionControls = this.makeDimensionControls();
    this.timeControl = this.makeTimeControl();

    this.root = this.makeContainer(
      this.makeTitle(vCluster.cluster.label!),
      this.makeControl("Dimension", 'CSControl', ...this.dimensionControls),
      this.makeControl("Year Data", 'CSControl selectElementFlex', this.timeControl),
      this.makeControl("Zoom Direction", 'CSControl selectElementFlex', this.makeZoomDirectionControl('CSDropSelect')),
      this.makeControl("Color Transform", 'CSControl selectElementFlex', this.makeColorTransformControl('CSDropSelect')),
      createElement("hr", { border: "1px solid rgba(110, 117, 124)" })
    );

    for (let i = 0; i < this.levels; ++i) {
      this.syncDimensionControl(i);
    }
    this.updateDimension();
    this.updateTimestamp();
  }

  /*  Getters for private members */

  public getDimensionControls(): HTMLSelectElement[] {
    return this.dimensionControls;
  }

  public getOnDimensionSelect(): (index: number) => void {
    return this.onDimensionSelect.bind(this);
  }

  public getUpdateDimension(): () => void {
    return this.updateDimension.bind(this);
  }

  public getRoot(): HTMLElement {
    return this.root;
  }


  /*  Private methods  */

  private getDepth(dimension: Dimensions): number {
    if ("key" in dimension) return 1;
    return (
      Math.max(0, ...dimension.children.map((dim) => this.getDepth(dim))) + 1
    );
  }

  private makeContainer(...children: HTMLElement[]) {
    return createElement("div", null, 'CSContainer', null, ...children,);
  }

  private makeTitle(title: string): HTMLElement {
    return createElement("div",
      null,
      'CSTitle',
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
  ) {
    let tmp = createSelectElement(options, null, "CSSelect", properties);
    return tmp;
  }

  private makeTimeControl(): HTMLSelectElement {
    return this.makeSelectElement(
      this.vCluster.cluster.timestamps.map((t) => ({
        name: t,
        value: t,
      })),
      {
        onchange: (e) => {
          this.updateTimestamp();
          (e.target as HTMLSelectElement).blur();
        },
      },
    );
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

  private makeDimensionControls(): HTMLSelectElement[] {
    const controls: HTMLSelectElement[] = [];
    for (let i = 0; i < this.levels; ++i) {
      controls.push(
        this.makeSelectElement([], {
          onchange: (e) => {
            this.onDimensionSelect(i);
            (e.target as HTMLSelectElement).blur();
          },
        }),
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
      {
        onchange: (e) => {
          if (this.vCluster instanceof VGeoCluster) {
            this.vCluster.zoomDirection = Number(
              (e.target as HTMLSelectElement).value,
            );
          }
        },
      },
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
      {
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
        },
      },
    );
  }

  private onDimensionSelect(index: number) {
    console.log(this.dimensionControls[index].value)
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
    this.updateDimension();
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
}
// Attach ClusterFactory to the global window object
(window as any).ClusterSettings = ClusterSettings;
