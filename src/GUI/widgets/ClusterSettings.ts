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

export class ClusterSettings {
  private static _container: HTMLElement | undefined;
  private static get container(): HTMLElement {
    if (!this._container) {
      this._container = createElement("div", {
        position: "absolute",
        left: "0",
        top: "10px",
        bottom: "0",
        width: "300px",
        overflowY: "scroll",
      });
      this._container.onwheel = (e) => {
        e.stopPropagation();
      };
      this._container.onmousedown = (e) => {
        e.stopPropagation();
      };
      document.querySelector("#model")!.append(this._container);
    }
    return this._container;
  }

  public static all: ClusterSettings[] = [];

  public static add(vCluster: VCluster) {
    const settings = new ClusterSettings(vCluster);
    ClusterSettings.container.append(settings.root);
    this.all.push(settings);
  }

  public static reset() {
    this.container.innerHTML = "";
    this.all.length = 0;
  }

  private root: HTMLElement;
  private levels: number;
  private dimemsionViewModels: DimensionCategory[] = [];
  private dimensionControls: HTMLSelectElement[] = [];
  private timeControl: HTMLSelectElement;

  constructor(private vCluster: VCluster) {
    this.levels = this.getDepth(vCluster.cluster.dimensions) - 1;

    this.dimemsionViewModels = this.makeDimensionControlViewModels();
    this.dimensionControls = this.makeDimensionControls();
    this.timeControl = this.makeTimeControl();

    this.root = this.makeContainer(
      this.makeTitle(vCluster.cluster.label!),
      this.makeControl("Dimension", ...this.dimensionControls),
      this.makeControl("Time", this.timeControl),
      this.makeControl("Zoom Direction", this.makeZoomDirectionControl()),
      this.makeControl("Color Transform", this.makeColorTransformControl()),
    );

    for (let i = 0; i < this.levels; ++i) {
      this.syncDimensionControl(i);
    }
    this.updateDimension();
    this.updateTimestamp();
  }

  private getDepth(dimension: Dimensions): number {
    if ("key" in dimension) return 1;
    return (
      Math.max(0, ...dimension.children.map((dim) => this.getDepth(dim))) + 1
    );
  }

  private makeContainer(...children: HTMLElement[]) {
    return createElement(
      "div",
      {
        color: "white",
        padding: "10px",
      },
      null,
      ...children,
    );
  }

  private makeTitle(title: string): HTMLElement {
    return createElement(
      "div",
      null,
      null,
      createInputElement(null, {
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
      createElement(
        "label",
        {
          marginLeft: "10px",
        },
        null,
        title,
      ),
    );
  }

  private makeInputLabel(text: string): HTMLElement {
    return createElement(
      "div",
      {
        color: "gray",
      },
      null,
      text,
    );
  }

  private makeControl(label: string, ...controls: HTMLElement[]): HTMLElement {
    return createElement(
      "div",
      {
        margin: "10px",
      },
      null,
      this.makeInputLabel(label),
      ...controls,
    );
  }

  private makeSelectElement(
    options: Array<{ name: string; value: string }>,
    properties?: Partial<HTMLSelectElement> | null,
  ) {
    return createSelectElement(
      options,
      {
        display: "block",
        width: "100%",
        background: "transparent",
        color: "white",
        fontSize: "14px",
      },
      properties,
    );
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
      this.dimemsionViewModels[i].children.map((dim) => ({
        name: dim.name,
        value: "key" in dim ? dim.key : dim.name,
      })),
    );
  }

  private makeZoomDirectionControl() {
    return createSelectElement(
      [
        {
          name: "In",
          value: "1",
        },
        {
          name: "Out",
          value: "-1",
        },
      ],
      {
        display: "block",
        width: "100%",
        background: "transparent",
        color: "white",
        fontSize: "14px",
      },
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

  private makeColorTransformControl() {
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
      {
        display: "block",
        width: "100%",
        background: "transparent",
        color: "white",
        fontSize: "14px",
      },
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
    if (index < this.levels - 1) {
      this.dimemsionViewModels[index + 1] = this.dimemsionViewModels[
        index
      ].children.find(
        (dim) => dim.name === this.dimensionControls[index].value,
      ) as DimensionCategory;

      for (let i = index + 2; i < this.levels; ++i) {
        this.dimemsionViewModels[i] = this.dimemsionViewModels[i - 1]
          .children[0] as DimensionCategory;
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
