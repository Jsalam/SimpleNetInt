"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connector = void 0;
var Connector = /** @class */ (function () {
    function Connector(id, _kind, _index) {
        this.vConnectorObserver = null;
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
    Connector.prototype.equals = function (conn) {
        var rtn = false;
        if (this.id.cluster == conn.id.cluster &&
            this.id.cat == conn.id.cat &&
            this.id.pajekIndex == conn.id.pajekIndex) {
            rtn = true;
        }
        if (rtn) {
            rtn = this.kind === conn.kind;
        }
        return rtn;
    };
    Connector.prototype.subscribeEdgeObserver = function (edge) {
        edge.kind = this.kind;
        this.edgeObservers.push(edge);
    };
    Connector.prototype.subscribeVConnector = function (observer) {
        this.vConnectorObserver = observer;
    };
    Connector.prototype.notifyVConnector = function (data) {
        this.vConnectorObserver.getData(data);
    };
    Connector.prototype.getJSON = function () {
        // return this.kind;
    };
    return Connector;
}());
exports.Connector = Connector;
