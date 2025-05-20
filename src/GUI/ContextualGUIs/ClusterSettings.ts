import { Canvas } from "../../canvas/canvas";
import { DimensionCategory, Dimensions } from "../../factories/clusterFactory";
import { VCluster } from "../../visualElements/vCluster";

export class ClusterSettings {
  private static _container: HTMLElement | undefined;
  private static get container(): HTMLElement {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.style.position = "absolute";
      this._container.style.left = "0";
      this._container.style.top = "10px";
      this._container.style.bottom = "0";
      this._container.style.width = "300px";
      this._container.style.overflowY = "scroll";
      document.querySelector("#model")!.append(this._container);
    }
    return this._container;
  }

  public static all: ClusterSettings[] = [];

  public static add(vCluster: VCluster) {
    const settings = new ClusterSettings(vCluster);
    this.all.push(settings);
    ClusterSettings.container.append(settings.root);
  }

  public static reset() {
    this.all.length = 0;
    this.container.innerHTML = "";
  }

  private root = document.createElement("div");
  private dimensionControls: HTMLSelectElement[] = [];

  constructor(private vCluster: VCluster) {
    this.root.style.color = "white";
    this.root.style.padding = "10px";

    const label = document.createElement("div");
    this.root.append(label);

    const visibilityControl = document.createElement("input");
    visibilityControl.type = "checkbox";
    label.append(visibilityControl);
    visibilityControl.checked = true;
    visibilityControl.onclick = () => {
      this.vCluster.visible = visibilityControl.checked;
    };

    const labelText = document.createElement("label");
    labelText.style.marginLeft = "10px";
    labelText.textContent = vCluster.cluster.label!;
    label.append(labelText);

    const { timestamps, dimensions } = vCluster.cluster;

    {
      // dimension controls
      const depth = this.getDepth(dimensions);

      const controls = document.createElement("div");
      controls.style.margin = "10px";
      this.root.append(controls);

      const label = document.createElement("div");
      label.style.color = "gray";
      label.textContent = "Dimension";
      controls.append(label);

      for (let i = 0; i < depth - 1; ++i) {
        const select = this.createSelectElement();
        select.onchange = () => {
          this.onSelect(i);
          select.blur();
        };
        controls.append(select);
        this.dimensionControls.push(select);
      }
      if (this.dimensionControls.length) {
        this.setControlOptions(
          this.dimensionControls[0],
          dimensions.children.map((dim) => ({
            name: dim.name,
            value: "key" in dim ? dim.key : dim.name,
          })),
        );
        this.onSelect(0);
      }
    }

    {
      // timestamp controls
      const controls = document.createElement("div");
      controls.style.margin = "10px";
      this.root.append(controls);

      const label = document.createElement("div");
      label.style.color = "gray";
      label.textContent = "Period";
      controls.append(label);

      const select = this.createSelectElement();
      this.setControlOptions(
        select,
        timestamps.map((t) => ({
          name: t,
          value: t,
        })),
      );
      select.onchange = () => {
        this.setTimestamp(select.value);
        select.blur();
      };
      controls.append(select);
      this.setTimestamp(select.value);
    }
  }

  private createSelectElement() {
    const select = document.createElement("select");
    select.style.display = "block";
    select.style.width = "100%";
    select.style.background = "transparent";
    select.style.color = "white";
    select.style.fontSize = "14px";
    return select;
  }

  private getDepth(dimension: Dimensions): number {
    if ("key" in dimension) return 1;
    return Math.max(...dimension.children.map((dim) => this.getDepth(dim))) + 1;
  }

  private onSelect(index: number) {
    if (index === this.dimensionControls.length - 1) {
      this.setDimension(this.dimensionControls[index].value);
    } else {
      this.selectInternal(index);
    }
  }

  private setDimension(dimension: string) {
    this.vCluster.dimension = dimension;
    this.vCluster.updatePalette();
    Canvas.update();
  }

  private setTimestamp(timestamp: string) {
    this.vCluster.timestamp = timestamp;
    this.vCluster.updatePalette();
    Canvas.update();
  }

  private selectInternal(index: number) {
    let cur: DimensionCategory | undefined = this.vCluster.cluster.dimensions;
    for (let i = 0; i <= index; ++i) {
      if (!cur) break;
      const value = this.dimensionControls[i].value;
      cur = cur.children.find((o) => o.name === value) as DimensionCategory;
    }

    const next = this.dimensionControls[index + 1];
    if (cur) {
      this.setControlOptions(
        next,
        cur.children.map((dim) => ({
          name: dim.name,
          value: "key" in dim ? dim.key : dim.name,
        })),
      );
    } else {
      next.innerHTML = "";
    }

    this.onSelect(index + 1);
  }

  private setControlOptions(
    select: HTMLSelectElement,
    options: Array<{ name: string; value: string }>,
  ) {
    select.innerHTML = "";
    for (let o of options) {
      const option = document.createElement("option");
      option.value = o.value;
      option.textContent = o.name;
      select.append(option);
    }
  }
}
