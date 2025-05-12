import { Node } from "./node";

export class Cluster {
  label: string | undefined;
  description: string | undefined;
  nodes: Node[];
  id: string;
  type: string;

  constructor(id: string, type: string) {
    this.label;
    this.description;
    this.nodes = [];
    this.id = id;
    this.type = type;
  }

  addNode(cat: Node) {
    this.nodes.push(cat);
  }

  setLabel(label: string) {
    this.label = label;
  }

  setDescription(text: string) {
    this.description = text;
  }

  getNode(index: number) {
    let rtn = this.nodes.filter((n) => {
      return n.idCat.index === index;
    })[0];
    return rtn;
  }

  getConnectors() {
    let rtn = [];
    for (const node of this.nodes) {
      const connectors = node.getConnectors();
      for (const element of connectors) {
        rtn.push(element);
      }
    }
    return rtn;
  }

  getJSON() {
    let rtn = {
      clusterID: this.id,
      clusterLabel: this.label,
      clusterDescription: this.description,
      nodes: [] as unknown[],
    };
    this.nodes.forEach((element) => {
      let tmpN = element.getJSON();
      rtn.nodes.push(tmpN);
    });
    return rtn;
  }
}
