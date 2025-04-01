/** The connector is an anchor within the node that holds edges linked to this node.
 * There might be diverse kinds of connectors in a node, thus there are diverse kind of edges.
 * The Edges kind is the same as the source connector's kind*/
import { VConnector } from "../visualElements/vConnector";
import { Identifier } from "../types";
import { Edge } from "./edge";

export class Connector {
  vConnectorObserver: VConnector | null = null;
  id: {
    cluster: unknown;
    cat: unknown;
    index: unknown;
    pajekIndex: unknown;
  };
  kind: string;
  edgeObservers: Edge[];

  constructor(id: Identifier, _kind: string, _index: number) {
    this.id = {
      cluster: id.cluster,
      cat: id.index,
      index: _index,
      pajekIndex: id.pajekIndex,
    };
    this.kind = _kind;
    // observer pattern
    this.vConnectorObserver; // the subscribed vNode
    this.edgeObservers = [];
  }

  equals(conn: Connector) {
    let rtn = false;
    if (
      this.id.cluster == conn.id.cluster &&
      this.id.cat == conn.id.cat &&
      this.id.pajekIndex == conn.id.pajekIndex
    ) {
      rtn = true;
    }
    if (rtn) {
      rtn = this.kind === conn.kind;
    }
    return rtn;
  }

  subscribeEdgeObserver(edge: Edge) {
    edge.kind = this.kind;
    this.edgeObservers.push(edge);
  }

  subscribeVConnector(observer: VConnector) {
    this.vConnectorObserver = observer;
  }

  notifyVConnector(data: unknown) {
    this.vConnectorObserver!.getData(data);
  }

  getJSON() {
    // return this.kind;
  }
}
