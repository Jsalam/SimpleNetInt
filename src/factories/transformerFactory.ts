import {Transformer} from "../canvas/transformer";
import {ClusterFactory} from "./clusterFactory";
import {Canvas} from "../canvas/canvas";
import {VCluster} from "../visualElements/vCluster";
import p5 from "p5";

/**
 * This class manages all the transformation matrices used in the visualization, except for the native matrices used by p5.js
 * The matrices are usually associated to vClusters
 */

export class TransFactory {
  static transformers: Transformer[];

  static init() {
    // clean elements
    TransFactory.transformers = [];

    for (const vC of ClusterFactory.vClusters) {
      console.log(vC);
      TransFactory.initTransformer(vC);
    }
  }

  static initTransformer(vC: VCluster) {
    let temp = new Transformer(vC);

    // disable transformations
    temp.active = false;

    // add to collection
    TransFactory.transformers.push(temp);

    // transformers listens to Cnavas events
    Canvas.subscribe(temp);
  }

  static zoom(amnt: number) {
    for (const tr of TransFactory.transformers) {
      tr.zoom(amnt);
    }
  }

  static crissCross(amnt: number) {
    for (let index = 0; index < TransFactory.transformers.length; index++) {
      const transformer = TransFactory.transformers[index];
      if (index % 2 == 0) {
        transformer.zoom(amnt);
      } else {
        transformer.zoom(1 / amnt);
      }
    }
  }

  static reset() {
    for (const tr of TransFactory.transformers) {
      tr.reset();
    }
  }

  static pushVClusters() {
    for (const tr of TransFactory.transformers) {
      tr.pushVCluster();
    }
  }

  static popVClusters() {
    for (const tr of TransFactory.transformers) {
      tr.popVCluster();
    }
  }

  static getTransformerByVClusterID(id: unknown) {
    return TransFactory.transformers.filter(
      (tr) => tr.vCluster.cluster.id == id,
    )[0];
  }

  static displayStatus(pos: p5.Vector, renderer: p5) {
    renderer.textSize(12);
    renderer.noStroke();
    renderer.fill(255, 255, 255);
    renderer.textAlign(renderer.LEFT);

    let outputString = "Press key number to manipulate local domain zoom: ";

    renderer.fill(150);

    for (let i = 0; i < TransFactory.transformers.length; i++) {
      let tr = TransFactory.transformers[i];

      outputString += tr.vCluster.cluster.id + ". " + tr.vCluster.cluster.label;

      if (tr.active) {
        outputString += ": active";
      }

      outputString += "   ";
    }

    if (TransFactory.transformers.length == 0) {
      outputString = "No clustering domains in tranformer factory";
    }

    renderer.text(outputString, pos.x + 10, pos.y + 35);
    renderer.stroke(255);
  }

  static get(__UNKNOWN_ARG__: unknown): Transformer | undefined {
    // FIXME: NO IMPLEMENTATION
    return undefined;
  }
}

TransFactory.transformers = [];
