import { VCluster } from "../../visualElements/vCluster";
import { createElement, createInputElement, createSelectElement, updateSelectOptions } from "../DOM/DOMUtils";
import { Utilities } from "../../utilities/utilities";
import { LegendScaleBar } from "../legends/LegendScaleBar";
import chroma from "chroma-js";

export class ClusterLegend {
  container: HTMLElement;
  vCluster: VCluster;
  vScale: HTMLElement | undefined;
  scaleValues: HTMLElement | undefined;
  visible: boolean;
  id: string;
  bar: LegendScaleBar | undefined;

  constructor(vCluster: VCluster) {
    this.vCluster = vCluster;
    this.container = createElement("div", null, "legendContainer");
    this.visible = true;
    this.container.id = vCluster.cluster.id;
    this.id = vCluster.cluster.id;

    // add a label
    this.container.append(this.setLabel());

    this.bar = new LegendScaleBar(10, 10000, 5);
  }

  /**
   * Create a label element for the cluster's legend.
   * @param label Optional text to use for the label. If not provided,
   *              the method uses the cluster's default label.
   * @returns A DIV element containing the label text.
   */
  setLabel(label?: string): HTMLElement {
    let rtn = createElement("div", { fontSize: "0.7em" }, "textLegend");
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

  addScaleValues(low?: number, high?: number, ticks?: number) {
    if (!this.scaleValues) {
      this.scaleValues = createElement("div", null, "scaleValues");
      this.scaleValues.id = "scaleValues";

      let wrapper = createElement("div", { position: "relative", width: "100%" }, null);

      let tks = [];

      // min
      let min = createElement("div", { fontSize: "0.55em", textAlign: "left", left: "0%" }, "textLegend tick minTick");
      min.id = "minValue";
      if (low) min.innerHTML = String(Utilities.formatter.format(low));
      else min.innerHTML = "-";

      // max
      let max = createElement("div", { fontSize: "0.55em", textAlign: "right", right: "-3%" }, "textLegend tick maxTick");
      max.id = "maxValue";
      if (high) max.innerHTML = String(Utilities.formatter.format(high));
      else max.innerHTML = "-";

      tks.push(min);

      // ticks
      if (!ticks) {
        ticks = 3;
        for (let i = 0; i < ticks; i++) {
          let leftPosition = `${((i + 1) / 4) * 100}`;

          let tmp = createElement("div", { fontSize: "0.55em", left: leftPosition + "%" }, "textLegend tick");
          tmp.id = "intValue" + leftPosition;
          tmp.innerHTML = "'";
          tks.push(tmp);
        }
      }

      tks.push(max);

      wrapper.append(...tks);
      this.scaleValues.append(wrapper);

      this.container.append(this.scaleValues);
    }
  }

  /**
   * Add or update a legend comment for the cluster.
   *
   * If a comment element already exists in the legend container, this method
   * updates its text content. Otherwise, it creates a new comment element and
   * appends it to the legend container.
   *
   * @param comment - The text to display in the legend comment.
   */
  private addComment(comment: string) {
    const existing = this.container.querySelector("#legendComment") as HTMLElement | null;
    if (existing) {
      existing.innerHTML = comment;
    } else {
      let com = createElement("div", { fontSize: "0.55em" }, "textLegend");
      com.id = "legendComment";
      com.innerHTML = comment;
      this.container.append(com);
    }
  }

  /**
   * Retrieve the comment for the current cluster based on filter parameters
   * and append it to the legend.
   *
   * @param params Optional parameter map containing:
   *   - filteringKey: the cluster dimension name to match
   *   - filteringValue: the child entry name to match within the cluster dimension
   *   - variableKey: the key of the variable whose comment should be displayed
   */
  retrieveAndAddComment(params: Record<string, string> | undefined) {
    if (!params) return;

    const clusterDimensions = this.vCluster.cluster.dimensions;

    if (clusterDimensions.name == params["filteringKey"]) {
      // iterate over the children looking for the entry with name == filteringValue
      clusterDimensions.children.forEach((element) => {
        if (element.name == params!["filteringValue"]) {
          // iterate over the children looking for the entry with key == variableKey
          element.children.forEach((item: any) => {
            if (item.key == params!["variableKey"]) {
              item.comment ? this.addComment(item.comment) : this.addComment("_ _");
            }
          });
        }
      });
    }
  }

  updateScaleColors(lowColor?: string, highColor?: string) {
    if (lowColor && highColor) {
      // make custom color scale
      const scale = chroma.scale([lowColor, highColor]);
      // updateColors
      this.bar?.setBinColors(this.vCluster.scalarTransform, scale);
    } else if (this.vCluster.colorScale) {
      // updateColors
      this.bar?.setBinColors(this.vCluster.scalarTransform, this.vCluster.colorScale);
    } else {
      console.log("No colorScale yet in " + this.vCluster.cluster.label);
    }

    // clear old bar
    let vScale = this.container.querySelector(".vScaleLegend") as HTMLElement | null;
    if (vScale) {
      while (vScale.firstChild) {
        vScale.removeChild(vScale.firstChild);
      }
      // append the new bar
      let newBar = this.bar?.getHTMLElement();
      if (newBar) {
        this.container.replaceChild(newBar, vScale);
      }
    }
  }

  updateScaleValues(low: number, high: number) {
    if (this.scaleValues) {
      // get child elements by id
      const min = this.scaleValues.querySelector("#minValue") as HTMLElement | null;
      const max = this.scaleValues.querySelector("#maxValue") as HTMLElement | null;
      const center = this.scaleValues.querySelector("#intValue50") as HTMLElement | null;
      const istQ = this.scaleValues.querySelector("#intValue25") as HTMLElement | null;
      const erdQ = this.scaleValues.querySelector("#intValue75") as HTMLElement | null;
      const midVal = (high - low) * 0.5;
      const ist = (high - low) * 0.25;
      const erd = (high - low) * 0.75;
      if (min) min.innerHTML = String(Utilities.formatter.format(low));
      if (max) max.innerHTML = String(Utilities.formatter.format(high));
      if (istQ) istQ.innerHTML = String(Utilities.formatter.format(ist));
      if (center) center.innerHTML = String(Utilities.formatter.format(midVal));
      if (erdQ) erdQ.innerHTML = String(Utilities.formatter.format(erd));
    }
  }
}
