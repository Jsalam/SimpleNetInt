/** The connector is an anchor within the node that holds edges linked to this node. 
 * There might be diverse kinds of connectors in a node, thus there are diverse kind of edges. 
 * The Edges kind is the same as the source connector's kind*/

class Connector {
    constructor(id, _kind, _index) {
        this.id = { cluster: id.cluster, cat: id.index, index: _index, pajekIndex: id.pajekIndex }
        this.kind = _kind;
        // observer pattern
        this.vConnectorObserver; // the subscribed vNode
        this.edgeObservers = [];
    }

    subscribeEdgeObserver(edge) {
        edge.kind = this.kind;
        this.edgeObservers.push(edge);
    }

    subscribeVConnector(observer) {
        this.vConnectorObserver = observer;
    }

    notifyVConnector(data) {
        this.vConnectorObserver.getData(data)
    }

    popThisConnector() {
        this.vConnectorObserver.popLastConnector();
    }

    getJSON() {
        // return this.kind;
    }
}