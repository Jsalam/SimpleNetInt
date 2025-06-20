import p5 from "p5";
import { Cluster } from "../graphElements/cluster";
import { gp5 } from "../main";
import { VCluster } from "./vCluster";

export class VSelectionCluster extends VCluster {
  constructor(
    cluster: Cluster,
    x: number,
    y: number,
    width: number,
    height: number,
    palette: string[],
  ) {
    super(cluster, x, y, width, height, palette);
  }

  show(renderer: p5) {
    super.show(renderer);
    gp5.push();
    gp5.stroke(255);
    gp5.strokeWeight(4);
    gp5.noFill();
    gp5.rect(
      this.boundingBox[0],
      this.boundingBox[1],
      this.boundingBox[2],
      this.boundingBox[3],
    );
    gp5.pop();
  }
}
