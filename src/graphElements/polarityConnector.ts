/** These are connectors with different a polarity either true or false. These connectors can only take edges coming from connectors with opposite polarity
 */
class PolarityConnector {
  constructor(id, _index, polarity, _count) {
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

  subscribeNode(observer) {
    this.nodeObserver = observer;
  }

  subscribeVConnector(observer) {
    this.vConnectorObserver = observer;
  }

  notifyObserver(data) {
    if (data instanceof Edge) {
      this.nodeObserver.splitConnectors(data);
    }
  }

  popThisConnector() {
    this.nodeObserver.popLastConnector(this.polarity);
  }

  workOnLastEdge() {
    let lastEdge;
    if (document.getElementById("edit").checked) {
      if (!this.taken) {
        // get the last edge in edges collection.
        lastEdge = EdgeFactory.EDGES.slice(-1)[0];

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
    let tmpEdge = new Edge(this);
    EdgeFactory.edges.push(tmpEdge);
    // dissable this connector
    this.taken = true;
    return tmpEdge;
  }

  closeEdge(lastEdge) {
    // evaluate source and target cluster difference
    if (lastEdge.source.id.polarity != this.id.polarity) {
      // set target
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

  recallEdge(lastEdge) {
    // Enable source connector
    lastEdge.source.taken = false;
    // remove temporary edge
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
