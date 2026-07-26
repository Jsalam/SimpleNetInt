import { Scale } from "chroma-js";
import { Mapper } from "../../utilities/mapper";

export class LegendScaleBar {
  label: string = "";
  bins: number; // one less than the desired 
  svgElement: SVGElement | undefined;
  minVal: number = -Infinity;
  maxVal: number = Infinity;
  colorValues: string[] | undefined;

  constructor(minVal: number, maxVal: number, bins: number = 10) {
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.bins = bins;
    this.colorValues = [];
  }

  setBinColors(transformerName: keyof typeof Mapper.scalarTransforms, colorScale: Scale | undefined, nbins?: number): string[] | undefined {
    this.colorValues = []; // clear the arrray
    if (nbins) this.bins = nbins;
    const transformer = Mapper[transformerName];
    // claculate the percentiles by sorting all the nodes by attribute

    // Array of hex colors to visualize
    for (let i = 0; i <= this.bins; i++) {
      let val = transformer(i, 0, this.bins);
      let colorHex;
      colorScale ? (colorHex = colorScale(val).hex()) : (colorHex = "#A0A0A0");
      this.colorValues!.push(colorHex);
    }
    return this.colorValues;
  }

  getHTMLElement(): HTMLElement {
    // 1. Create a container element
    const container = document.createElement("div");

    container.className = "vScaleLegend";
    container.style.display = "flex";
    container.style.height = "5px";

    // 2. Loop through the array and create a swatch for each color
    this.colorValues!.forEach((color) => {
      const swatch = document.createElement("div");

      // Style the individual color block
      swatch.style.width = "100%";
      swatch.style.height = "5px";
      swatch.style.backgroundColor = color;

      container.appendChild(swatch);
    });
    return container;
  }
}
