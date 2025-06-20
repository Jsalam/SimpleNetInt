import { VNode } from "./vNode";
import { Layout } from "./layouts/layout";
import { TransFactory } from "../factories/transformerFactory";
import { Button } from "./button";
import { CustomEvent, Observer } from "../types";
import p5 from "p5";
import { gp5 } from "../main";
import { Cluster } from "../graphElements/cluster";
import { ColorFactory } from "../factories/colorFactory";
import { Canvas } from "../canvas/canvas";
import { Node } from "../graphElements/node";
import { SortingWidget } from "../GUI/widgets/listWidget/sortingWidget";

export class VCluster extends Button implements Observer {
  vNodes: VNode[];
  cluster: Cluster;
  palette: string[];
  layout: Layout;
  timestamp: string | undefined;
  dimension: string | undefined;

  boundingBox: [number, number, number, number] = [0, 0, 0, 0];

  constructor(
    cluster: Cluster,
    x: number,
    y: number,
    width: number,
    height: number,
    palette: string[],
  ) {
    super(x, y, width, height);
    this.vNodes = [];
    this.cluster = cluster;
    this.palette = palette;

    // instantiate a layout
    this.layout = new Layout();
    this.populateVNodes(cluster);
    this.layout.subscribeVNodes(this.vNodes);

    // instantiate a tranformer for this vCluster
    TransFactory.initTransformer(this);
  }

  // Observing to Canvas
  fromCanvas(data: CustomEvent) {
    if (data.event instanceof MouseEvent) {
      // do something
    } else if (data.event instanceof KeyboardEvent) {
      // do something
    } else {
      // do something
    }
    return false;
  }

  populateVNodes(cluster: Cluster) {
    for (let index = 0; index < cluster.nodes.length; index++) {
      const node = cluster.nodes[index];

      // Create vNode
      let vNodeTemp: VNode | undefined;
      if (node instanceof Node) {
        // node size
        let vNodeW = 10;
        let vNodeH = 10;

        // instantiation
        vNodeTemp = new VNode(node, vNodeW, vNodeH, this);
        for (const connector of vNodeTemp.node.connectors) {
          vNodeTemp.addVConnector(connector);
        }
      }

      // set color if the data from JSON does not have color info
      if (!node.importedVNodeData!.color) {
        if (!this.palette) {
          vNodeTemp!.setColor("#adadad");
        } else if (this.palette.length < 1) {
          vNodeTemp!.setColor(ColorFactory.getColor(this.palette, 0));
        } else {
          vNodeTemp!.setColor(ColorFactory.getColor(this.palette, index));
        }
      }

      // add to colecction
      this.addVNode(vNodeTemp!, node.importedVNodeData!);
    }
  }

  addVNode(
    vNode: VNode,
    data?: {
      posX: number;
      posY: number;
      posZ: number;
      color: string;
    },
  ) {
    if (data) {
      const pos = gp5.createVector(data.posX, data.posY, data.posZ);
      vNode.updateCoords(pos, 0);
      vNode.setColor(data.color);
    } else {
      vNode.updateCoords(this.pos!, this.vNodes.length + 1);
      vNode.setColor(
        ColorFactory.getColor(this.palette, this.cluster.nodes.length),
      );
    }
    // subscribe to canvas
    Canvas.subscribe(vNode);

    // add to collection
    this.vNodes.push(vNode);
  }

  getVNode(node: Node) {
    return this.vNodes.filter((vN) => {
      return vN.node.idCat === node.idCat;
    })[0];
  }

  setPalette(palette: string[]) {
    if (palette) {
      this.palette = palette;
    }

    let counter = 0;
    if (this.palette) {
      for (let i = 0; i < this.vNodes.length; i++) {
        if (counter >= this.palette.length) {
          counter = 0;
        }
        this.vNodes[i].setColor(this.palette[counter]);
        counter++;
      }
    }
  }

  highlight(vNode: VNode) {}

  show(renderer: p5) {
    renderer.textAlign(gp5.LEFT, gp5.TOP);
    if (this.cluster.label) {
      renderer.textSize(12);
      renderer.fill(100);
      renderer.noStroke();
      renderer.textLeading(12);
      renderer.text(this.cluster.label, this.pos!.x, this.pos!.y, 140);
    }


  }

  updatePalette() {}

  getJSON() {
    let trans = TransFactory.getTransformerByVClusterID(this.cluster.id);
    let rtn = {
      clusterID: this.cluster.id,
      clusterLabel: this.cluster.label,
      clusterDescription: this.cluster.description,
      // The latest values of the transformer linked to this vCluster
      scaleFactor: trans.scaleFactor,
      matrixComponents: JSON.stringify(trans.transform),
      nodes: [] as unknown[],
    };

    this.vNodes.forEach((vNode) => {
      let tmpN = vNode.getJSON();
      rtn.nodes.push(tmpN);
    });
    return rtn;
  }
}
