import { ColorFactory } from "./colorFactory";
import { VCluster } from "../visualElements/vCluster";
import { Cluster } from "../graphElements/cluster";
import {
  addClusterToModalFormList,
  clearClusterModalFormList,
} from "../GUI/forms/addClusterModalForm";
import { TransFactory } from "./transformerFactory";
import { Node, NodeInit } from "../graphElements/node";
import { EdgeFactory } from "./edgeFactory";
import { VGeoCluster } from "../visualElements/vGeoCluster";
import { TransformerInit } from "../canvas/transformer";
import { Canvas } from "../canvas/canvas";
import { VNode } from "../visualElements/vNode";
import { gp5 } from "../main";
import { ClusterSettings } from "../GUI/ContextualGUIs/ClusterSettings";
import { VSelectionCluster } from "../visualElements/vSelectionCluster";
import { Vector } from "p5";

export interface DimensionCategory {
  name: string;
  children: Dimensions[];
}

export interface DimensionID {
  name: string;
  key: string;
}

export type Dimensions = DimensionCategory | DimensionID;

export interface ClusterInit extends TransformerInit {
  clusterID: string;
  clusterType?: string;
  clusterLabel: string;
  clusterDescription: string;
  mapName?: string;
  secondaryMapName?: string;
  bbox?: [number, number, number, number];
  nodes?: NodeInit[];
  timestamps?: string[];
  dimensions?: DimensionCategory;
  palette?: Record<string, [string, string]>;
}

export class ClusterFactory {
  static clusters: Cluster[];
  static vClusters: VCluster[];
  static countCat = 1;
  static wdth = 10;
  static hght = 10;
  // The distance between vClusters origin
  static gutter = 150;

  static selectionStart: Vector | null = null;
  static selectionEnd: Vector | null = null;
  static nextSelectionId = 0;

  static makeClusters(data: ClusterInit[]) {
    ClusterFactory.initParameters();
    ClusterFactory.clusters = [];
    this.vClusters = [];

    // global function from addClusterModalForm.js
    clearClusterModalFormList();

    for (let index = 0; index < Object.keys(data).length; index++) {
      this.instantiateCluster(data[index]);
    }

    //** Visual cluster section
    let x = ClusterFactory.wdth + ClusterFactory.gutter;
    for (let index = 0; index < ClusterFactory.clusters.length; index++) {
      //  vCluster parameters
      let cluster = ClusterFactory.clusters[index];
      let posX = 25 + x * index;
      let posY = 20;
      let width = ClusterFactory.wdth;
      let height = ClusterFactory.hght;
      let palette = ColorFactory.getPalette(index);

      // vCluster instantiation
      let tmp: any;
      if (cluster.type === "geo") {
        tmp = new VGeoCluster(
          cluster,
          posX,
          posY,
          width,
          height,
          palette,
          data[index].bbox!,
          data[index].mapName!,
          data[index].secondaryMapName!,
          data[index].palette!,
        ); //  /files/Cartographies/Brazil_Amazon.geojson
      } else {
        tmp = new VCluster(cluster, posX, posY, width, height, palette);
      }
      ClusterSettings.add(tmp);
      // set the VCluster transformer from data imported
      if (
        TransFactory.getTransformerByVClusterID(
          ClusterFactory.clusters[index].id,
        ).initFromDataValues(data[index])
      ) {
        // set the transformed values VCluster transformer from data imported
        for (const vNode of tmp.vNodes) {
          vNode.transformed = true;
        }
      }

      Canvas.subscribe(tmp);
      ClusterFactory.vClusters.push(tmp);
    }
  }

  /**
   * This function is used to create a new cluster in addition to the ones loaded from the imported json network
   * @param {Object} data cluster attributes. Usually entered with a form
   */
  static makeCluster(data: ClusterInit) {
    this.instantiateCluster(data);
    let x = ClusterFactory.wdth + ClusterFactory.gutter;
    let index = ClusterFactory.clusters.length - 1;
    let tmp;
    if (data.clusterType === "selection") {
      tmp = new VSelectionCluster(
        ClusterFactory.clusters[index],
        15 + x * index,
        10,
        ClusterFactory.wdth,
        ClusterFactory.hght,
        ColorFactory.getPalette(index),
      );
    } else {
      tmp = new VCluster(
        ClusterFactory.clusters[index],
        15 + x * index,
        10,
        ClusterFactory.wdth,
        ClusterFactory.hght,
        ColorFactory.getPalette(index),
      );
    }
    ClusterSettings.add(tmp);
    Canvas.subscribe(tmp);
    ClusterFactory.vClusters.push(tmp);
    return tmp;
  }

  /**
   * Layout parameters
   * @param {number} wdth node width
   * @param {number} hght node height. only used whith rectangular node shape
   * @param {number} gutter gap between columns of clusters
   */
  static initParameters(
    wdth: number = 10,
    hght: number = 10,
    gutter: number = 150,
  ) {
    ClusterFactory.wdth = wdth;
    ClusterFactory.hght = hght;
    ClusterFactory.gutter = gutter;
  }

  static instantiateCluster(data: ClusterInit) {
    let cluster = new Cluster(
      data.clusterID,
      data.clusterType!,
      data.timestamps,
      data.dimensions,
    );
    cluster.setLabel(data.clusterLabel);
    cluster.setDescription(data.clusterDescription);
    this.makeNodes(cluster, data);
    ClusterFactory.clusters.push(cluster);
    // global function from addClusterModalForm.js
    addClusterToModalFormList(data.clusterID, data.clusterLabel);
    //console.log("Cluster added. Total: " + ClusterFactory.clusters.length)
  }

  static makeNodes(cluster: Cluster, data: ClusterInit) {
    if (data.nodes) {
      // create Nodes
      for (let index = 0; index < data.nodes.length; index++) {
        let node = this.makeNode(cluster, data.nodes[index]);
        cluster.addNode(node);
      }
    }
  }

  static makeNode(cluster: Cluster, data: NodeInit) {
    let node = new Node(cluster.id, data.id, this.countCat);
    node.setLabel(data.nodeLabel);
    node.setDescription(data.nodeDescription);
    node.setAttributes(data.nodeAttributes);
    node.setImportedVNodeData(data.vNode!);
    ClusterFactory.countCat++;
    // create connectors if data comes with that info. Data usually comes from
    // the JSON file or the node created by user input
    if (data.connectors) {
      for (const connector of data.connectors) {
        node.addConnector(connector, node.connectors.length);
      }
    }
    return node;
  }

  static deleteNode(vNode: VNode) {
    console.log("delete node " + JSON.stringify(vNode.node.idCat));
    for (let vC of vNode.vConnectors) {
      for (let edgeObs of vC.connector.edgeObservers) {
        // go over all its vConnectors and ask them to delete themselves. That should delete all the edges referencing them
        EdgeFactory.deleteEdge(edgeObs);
      }
    }
    if (vNode.node.connectors.length == 0) {
      // get cluster
      let cluster = this.getCluster(vNode.node.idCat.cluster);
      let vCluster = this.getVCluster(vNode.node.idCat.cluster);

      // get node index
      const indexC = cluster.nodes.indexOf(vNode.node);
      const indexVC = vCluster.vNodes.indexOf(vNode);

      // delete node from array
      cluster.nodes.splice(indexC, 1);
      vCluster.vNodes.splice(indexVC, 1);

      // unsubscribe vNode
      Canvas.unsubscribe(vNode);

      console.log("Node and VNode deleted " + JSON.stringify(vNode.node.idCat));
    }
  }

  /**This is not the function used by the exportModalFrom. Look for the getJSON() function in VCluster class */
  static recordJSON(suffix: string) {
    let filename = "nodes.json";
    if (suffix) {
      filename = suffix + "_" + filename;
    }
    let output = [];
    for (let index = 0; index < ClusterFactory.clusters.length; index++) {
      output.push(ClusterFactory.clusters[index].getJSON());
    }
    gp5.saveJSON(output, filename);
  }

  static reset() {
    ClusterFactory.clusters = [];
    ClusterFactory.vClusters = [];
    ClusterFactory.countCat = 1;
  }

  static getVClusterOf(cluster: Cluster) {
    for (const vClust of ClusterFactory.vClusters) {
      if (vClust.cluster.id == cluster.id) return vClust;
    }
  }

  static resetAllConnectors() {
    for (const cluster of ClusterFactory.clusters) {
      for (const node of cluster.nodes) {
        node.resetConnectors();
      }
    }
  }

  static checkPropagation() {
    for (const vCluster of ClusterFactory.vClusters) {
      for (const vNode of vCluster.vNodes) {
        if (vNode.propagated) {
          vNode.node.propagate(vNode.node, vNode.propagated);
        }
      }
    }
  }

  static getVNodeOf(node: Node) {
    let vCluster = ClusterFactory.getVCluster(node.idCat.cluster);
    return vCluster.getVNode(node);
  }

  static getCluster(id: string) {
    const tmp = ClusterFactory.clusters.filter((elem) => {
      return elem.id == id;
    })[0];
    return tmp;
  }

  static getVCluster(id: string) {
    const tmp = ClusterFactory.vClusters.filter((elem) => {
      return elem.cluster.id == id;
    })[0];
    return tmp;
  }

  /**
   * Retrieves all the KINDS of connectors in every cluster.
   * To get the actual connectors us the function getConnectors
   * of the class Cluster
   * @returns Array of strings
   */
  static getAllConnectorKinds() {
    let rtn: string[] = [];
    for (const clust of ClusterFactory.clusters) {
      for (const node of clust.nodes) {
        const connectors = node.getConnectors();
        for (let i = 0; i < connectors.length; i++) {
          const element = connectors[i];
          if (!rtn.includes(element.kind)) rtn.push(element.kind);
        }
      }
    }
    return rtn;
  }

  static showSelectedArea() {
    if (!this.selectionStart || !this.selectionEnd) return;
    gp5.push();
    gp5.stroke(255);
    gp5.strokeWeight(4);
    gp5.noFill();
    gp5.rect(
      Math.min(this.selectionEnd.x, this.selectionStart.x),
      Math.min(this.selectionEnd.y, this.selectionStart.y),
      Math.abs(this.selectionEnd.x - this.selectionStart.x),
      Math.abs(this.selectionEnd.y - this.selectionStart.y),
    );
    gp5.pop();
  }

  static createSelection() {
    if (!this.selectionStart || !this.selectionEnd) return;
    const minX = Math.min(this.selectionEnd.x, this.selectionStart.x);
    const minY = Math.min(this.selectionEnd.y, this.selectionStart.y);
    const maxX = Math.max(this.selectionEnd.x, this.selectionStart.x);
    const maxY = Math.max(this.selectionEnd.y, this.selectionStart.y);

    const selectedVNodes: VNode[] = [];
    this.vClusters.forEach((cluster) => {
      cluster.vNodes.forEach((vNode) => {
        if (
          vNode.pos &&
          vNode.pos.x >= minX &&
          vNode.pos.x <= maxX &&
          vNode.pos.y >= minY &&
          vNode.pos.y <= maxY
        ) {
          selectedVNodes.push(vNode);
        }
      });
    });

    if (selectedVNodes.length > 0) {
      const selectionVCluster = this.makeCluster({
        clusterType: "selection",
        clusterDescription: "Cluster description",
        clusterID: "selection-" + this.nextSelectionId,
        clusterLabel: "Selection " + this.nextSelectionId,
        nodes: [],
      });
      this.nextSelectionId++;
      selectionVCluster.boundingBox = [minX, minY, maxX - minX, maxY - minY];
      selectionVCluster.vNodes = selectedVNodes;
      selectionVCluster.cluster.nodes = selectedVNodes.map(
        (vNode) => vNode.node,
      );
      selectedVNodes.forEach((vNode) => {
        vNode.parentVCluster = selectionVCluster;
      });
    }
    this.selectionStart = this.selectionEnd = null;
  }
}

// Attach ClusterFactory to the global window object
(window as any).ClusterFactory = ClusterFactory;
