import {Edge} from "./edge";
import {EdgeFactory} from "../factories/edgeFactory";
import {VConnector} from "../visualElements/vConnector";
import {CustomEvent} from "../types";
import {Node} from "./node";

/** These are connectors with a different polarity either true or false. These connectors can only take edges coming from connectors with opposite polarity
 */
class PolarityConnector {
  polarity: unknown;
  taken: boolean;
  nodeObserver: Node | undefined;
  vConnectorObserver: VConnector | undefined;
  id: {
    cluster: unknown;
    cat: unknown;
    index: unknown;
    polarity: unknown;
    pajekIndex: number;
  };

  constructor(
    id: {
      cluster: unknown;
      index: unknown;
    },
    _index: number,
    polarity: unknown,
    _count: number,
  ) {
    this.polarity = polarity;
    this.id = {
      cluster: id.cluster,
      cat: id.index,
      index: _index,
      polarity: this.polarity,
      pajekIndex: _count,
    };
    this.taken = false;
    // observer pattern
    this.nodeObserver; // the collection of subscribed nodes
    this.vConnectorObserver;
  }

  subscribeNode(observer: Node) {
    this.nodeObserver = observer;
  }

  subscribeVConnector(observer: VConnector) {
    this.vConnectorObserver = observer;
  }

  //NOTE: this method is not used. Deprecated
  /**
   * @deprecated
   * @param data 
   */
  notifyObserver(data: CustomEvent) {
    if (data instanceof Edge) {
      // @ts-ignore FIXME: method does not exist
      this.nodeObserver.splitConnectors(data);
    }
  }

  //NOTE: this method is not used. Deprecated
  /**
   * @deprecated
   */
  popThisConnector() {
    // @ts-ignore FIXME: method does not exist
    this.nodeObserver.popLastConnector(this.polarity);
  }

  /**
   * deprecated
   * @returns 
   */
  workOnLastEdge() {
    let lastEdge;
    if ((document.getElementById("edit") as HTMLInputElement).checked) {
      if (!this.taken) {
        // get the last edge in edges collection.
        // @ts-ignore FIXME: `EDGES` does not exist
        // NNOTE: FIXED
        lastEdge = EdgeFactory._edges.slice(-1)[0];

        // If there is at least one edge
        if (lastEdge) {
          if (lastEdge.open) {
            this.closeEdge(lastEdge);
          } else {
            lastEdge = this.sproutEdge();
          }
        } else {
          // create the first edge
          lastEdge = this.sproutEdge();
        }
      } else {
        console.log(
          "Connector taken, click on the + to add one connector to that category",
        );
      }
    }
    return lastEdge;
  }

  sproutEdge() {
    // create a new one
    // @ts-ignore FIXME: wrong argument type
    // NOTE: fixed, but I am not sure this is the right parameter
    let tmpEdge = new Edge(this.nodeObserver!);
    // @ts-ignore FIXME: `edges` does not exist
    // NOTE: FIXED
    EdgeFactory._edges.push(tmpEdge);
    // dissable this connector
    this.taken = true;
    return tmpEdge;
  }

  // NOTE: this method is not used. It is copies from a different class
  closeEdge(lastEdge: Edge) {
    // evaluate source and target cluster difference
    // @ts-ignore FIXME: type of `.id`
    if (lastEdge.source.id.polarity != this.id.polarity) {
      // set target
      // @ts-ignore FIXME: wrong argument type
      if (lastEdge.setTarget(this)) {
        // disable connector
        this.taken = true;
        // close edge
        lastEdge.open = false;
      } else {
        console.log("Issues clossing edge");
        this.recallEdge(lastEdge);
      }
    } else {
      console.log(
        "Impossible edge. Equal source and target category or polarity.",
      );
      console.log(lastEdge.source.id);
      console.log(this.id);
      this.recallEdge(lastEdge);
    }
  }

  recallEdge(lastEdge: Edge) {
    // Enable source connector
    lastEdge.source.taken = false;
    // remove temporary edge
    // @ts-ignore FIXME: `.edges` doesn't exist
    EdgeFactory.edges.pop();
    //vEdges.pop();
    this.taken = false;
  }

  getJSON() {
    let rtn = {
      id: {
        index: this.id.index,
      },
    };
    return rtn;
  }
}
