import {gp5} from "../../main";
import {VNode} from "../vNode";

/**
 * Instances of this class are associated with VClusters
 */
export class Layout {
  width: number;
  height: number;
  margin: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  area: {
    width: number;
    height: number;
  };
  vNodes: VNode[] | undefined;

  constructor() {
    this.width = gp5.width;
    this.height = gp5.height;
    this.margin = { left: 0, top: 0, right: 0, bottom: 0 };
    // the layout area excluding margins
    this.area = this.setArea();
    this.vNodes;
  }

  subscribeVNodes(vNodes: VNode[]) {
    this.vNodes = vNodes;
  }

  setWidth(wdth: number) {
    this.width = wdth;
    this.area = this.setArea(wdth, this.height);
  }

  setHeight(hght: number) {
    this.height = hght;
    this.area = this.setArea(this.width, hght);
  }

  setArea(wdth?: number, hght?: number) {
    let w, h;
    if (!wdth) {
      w = this.width - this.margin.left - this.margin.right;
    } else {
      w = wdth;
    }
    if (!hght) {
      h = this.height - this.margin.top - this.margin.bottom;
    } else {
      h = hght;
    }
    return { width: w, height: h };
  }

  linearArray(stepX: number, stepY: number) {
    const xCapacity = this.area.width / stepX;

    let xPos = 0;
    let yPos = 0;

    for (let i = 0; i < this.vNodes!.length; i++) {
      if (i > 0 && i % xCapacity == 0) {
        xPos = 0;
        yPos += stepY;
      }
      xPos += stepX;

      this.vNodes![i].setX(xPos);
      this.vNodes![i].setY(yPos);
    }
  }

  /**
   * Based on NetInt Concentric Layouts. https://github.com/LeonardoResearchGroup/NetInt/blob/master/Java/CommunityVisualizationJUNG/src/netInt/containers/layout/ConcentricLayout.java
   * @param {Number} maxRadius
   */
  concentricArray(maxRadius: number, gapFactor: number) {
    let accLength = 0;
    let maxCircumference = this._getCircumference(maxRadius);
    let largest = 0;
    let lastRadius = 0;
    // The collection of Nodes belonging to each tier
    let rings = [];

    // Temporary collection of nodes
    let tempVNodes = [];

    for (const vNode of this.vNodes!) {
      let nodeDiam = gapFactor * vNode.diam;
      accLength += nodeDiam;

      // This is to get the largest node diameter
      if (nodeDiam > largest) {
        largest = nodeDiam;
      }

      if (accLength <= maxCircumference) {
        // Push nodes into the first ring
        tempVNodes.push(vNode);
      } else {
        // Set the locations for nodes in the collection and get the tier radius
        lastRadius = this.setLocations(
          maxCircumference,
          lastRadius,
          gapFactor,
        );

        // Add the collected nodes satisfying the former condition
        rings.push(tempVNodes);

        // reset acclength to the diameter of the new firstnode
        accLength = nodeDiam;

        // Set the next tier radius
        lastRadius += largest;

        // Gets the next tier circumference
        maxCircumference = this._getCircumference(lastRadius);

        // Reset the collection of nodes
        tempVNodes = [];

        // This is to get the largest node diameter
        largest = nodeDiam;

        // add the current node to the new tier's collection
        tempVNodes.push(vNode);
      }
    }

    // Set the locations for nodes in the collection
    this.setLocations(maxCircumference, lastRadius, gapFactor);

    // Adds the very last tier's collection to rings
    rings.push(tempVNodes);

    // clean memory
    tempVNodes = [];

    // Return collection
    //  return rings;
  }

  setLocations(
    totalLength: number,
    lastRadius: number,
    gapFactor: number
  ) {
    // Distribute all possible angles in all length units
    let angleFraction = (Math.PI * 2) / this.vNodes!.length; //totalLength;

    // Calculate the tier's radius
    let radius = totalLength / (Math.PI * 2);

    // If the radius is too small
    if (radius < 200) {
      radius = 200;
    }

    // If the radius is smaller than the previous tier
    if (radius < lastRadius) {
      radius = lastRadius;
    }

    // Accumulated length
    let accLength = 0;

    for (let i = 0; i < this.vNodes!.length; i++) {
      let nodeLength = gapFactor * this.vNodes![i].diam;

      let angle = i * angleFraction;

      accLength += nodeLength;
      // set the location for that vertex
      let posX = Math.cos(angle) * radius;
      let posY = Math.sin(angle) * radius;

      this.vNodes![i].setX(posX);
      this.vNodes![i].setY(posY);
    }

    return radius;
  }

  _getCircumference(radius: number) {
    let result = 2 * Math.PI * radius;
    return result;
  }
}
