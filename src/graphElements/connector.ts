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

    equals(conn) {
        let rtn = false;
        if (this.id.cluster == conn.id.cluster &&
            this.id.cat == conn.id.cat &&
            this.id.pajekIndex == conn.id.pajekIndex) {
            rtn = true;
        }
        if (rtn) {
            rtn = this.kind === conn.kind;
        }
        return rtn;
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

    getJSON() {
        // return this.kind;
    }
}