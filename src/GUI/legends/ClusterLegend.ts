import { VCluster } from "../../visualElements/vCluster";
import {
  createElement,
  createInputElement,
  createSelectElement,
  updateSelectOptions,
} from "../DOM/DOMUtils";

export class ClusterLegend {
  container: HTMLElement;
  vCluster: VCluster;
  vScale: HTMLElement | undefined;
  scaleValues: HTMLElement | undefined;
  visible: boolean;
  id: string;

  constructor(vCluster: VCluster) {
    this.vCluster = vCluster;
    this.container = createElement("div", null, "legendContainer");
    this.visible = true;
    this.container.id = vCluster.cluster.id;
    this.id = vCluster.cluster.id;

    // add a label
    this.container.append(this.setLabel());
  }

  /**
   * Create a label element for the cluster's legend.
   * @param label Optional text to use for the label. If not provided,
   *              the method uses the cluster's default label.
   * @returns A DIV element containing the label text.
   */
  setLabel(label?: string): HTMLElement {
    let rtn = createElement("div", { fontSize: "0.7em" }, "CSSelect");
    if (label) {
      rtn.innerHTML = label;
    } else {
      rtn.innerHTML = this.vCluster.cluster.label!;
    }
    return rtn;
  }

  addVScale() {
    if (!this.vScale) {
      this.vScale = createElement("div", null, "vScaleLegend");
      this.vScale.style.border = "0.5px solid #80808080";
      this.container.append(this.vScale);
    }
  }

  addScaleValues(low?: number, high?: number) {
    if (!this.scaleValues) {
      this.scaleValues = createElement("div", null, "scaleValues");
      this.scaleValues.id = "scaleValues";

      // min
      let min = createElement("div", { fontSize: "0.55em" }, "CSSelect");
      min.id = "minValue";
      if (low) min.innerHTML = String(low);
      else min.innerHTML = "-";

      // max
      let max = createElement("div", { fontSize: "0.55em" }, "CSSelect");
      max.id = "maxValue";
      if (high) max.innerHTML = String(high);
      else max.innerHTML = "-";

      this.scaleValues.append(min, max);

      this.container.append(this.scaleValues);
    }
  }

  updateScaleColors(lowColor?: string, highColor?: string) {
    if (this.vCluster.colorScale) {
      if (lowColor && highColor) {
        this.vScale!.style.background = `linear-gradient(to right,${lowColor}, ${highColor})`;
      } else {
        let lowHigh = this.vCluster.colorScale.colors(2);
        this.vScale!.style.background = `linear-gradient(to right,${lowHigh[0]}, ${lowHigh[1]})`;
      }
    } else {
      console.log("No colorScale yet in " + this.vCluster.cluster.label);
    }
  }

  updateScaleValues(low: number, high: number) {
    if (this.scaleValues) {
      // get child elements by id
      const min = this.scaleValues.querySelector(
        "#minValue",
      ) as HTMLElement | null;
      const max = this.scaleValues.querySelector(
        "#maxValue",
      ) as HTMLElement | null;
      if (min) min.innerHTML = String(low.toFixed(2));
      if (max) max.innerHTML = String(high.toFixed(2));
    }
  }
}
