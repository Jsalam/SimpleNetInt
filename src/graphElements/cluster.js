"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cluster = void 0;
var Cluster = /** @class */ (function () {
    function Cluster(id, type, timestamps, dimensions) {
        if (timestamps === void 0) { timestamps = []; }
        if (dimensions === void 0) { dimensions = { name: "", children: [] }; }
        this.timestamps = timestamps;
        this.dimensions = dimensions;
        this.label;
        this.description;
        this.nodes = [];
        this.id = id;
        this.type = type;
    }
    Cluster.prototype.addNode = function (cat) {
        this.nodes.push(cat);
    };
    Cluster.prototype.setLabel = function (label) {
        this.label = label;
    };
    Cluster.prototype.setDescription = function (text) {
        this.description = text;
    };
    Cluster.prototype.getNode = function (index) {
        var rtn = this.nodes.filter(function (n) {
            return n.idCat.index === index;
        })[0];
        return rtn;
    };
    Cluster.prototype.getConnectors = function () {
        var rtn = [];
        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            var connectors = node.getConnectors();
            for (var _b = 0, connectors_1 = connectors; _b < connectors_1.length; _b++) {
                var element = connectors_1[_b];
                rtn.push(element);
            }
        }
        return rtn;
    };
    Cluster.prototype.getJSON = function () {
        var rtn = {
            clusterID: this.id,
            clusterLabel: this.label,
            clusterDescription: this.description,
            nodes: [],
        };
        this.nodes.forEach(function (element) {
            var tmpN = element.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    };
    return Cluster;
}());
exports.Cluster = Cluster;
