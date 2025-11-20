"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Edge = void 0;
var Edge = /** @class */ (function () {
    function Edge(source) {
        this.source = source;
        // the kind is set in connector class where the edge is subscribed to the connector
        this.kind;
        this.target;
        this.id;
        this.open = true;
        this.weight = 1;
    }
    Edge.prototype.equals = function (edgeA) {
        var A, B;
        var rtn = false;
        if (edgeA.target) {
            A = [edgeA.source.idCat.pajekIndex, edgeA.target.idCat.pajekIndex];
        }
        else {
            A = [edgeA.source.idCat.pajekIndex, undefined];
        }
        if (this.target) {
            B = [this.source.idCat.pajekIndex, this.target.idCat.pajekIndex];
        }
        else {
            B = [this.source.idCat.pajekIndex, undefined];
        }
        rtn = A[0] === B[0] && A[1] === B[1];
        if (rtn) {
            rtn = edgeA.kind === this.kind;
        }
        return rtn;
    };
    Edge.prototype.setWeight = function (val) {
        this.weight = val;
    };
    Edge.prototype.increaseWeight = function () {
        this.weight++;
    };
    Edge.prototype.decreaseWeight = function () {
        if (this.weight > 1) {
            this.weight--;
        }
    };
    Edge.prototype.getSourceConnector = function () {
        for (var _i = 0, _a = this.source.connectors; _i < _a.length; _i++) {
            var connector = _a[_i];
            for (var _b = 0, _c = connector.edgeObservers; _b < _c.length; _b++) {
                var edgeObs = _c[_b];
                if (edgeObs.equals(this)) {
                    return connector;
                }
            }
        }
    };
    Edge.prototype.getTargetConnector = function () {
        if (this.target) {
            for (var _i = 0, _a = this.target.connectors; _i < _a.length; _i++) {
                var connector = _a[_i];
                for (var _b = 0, _c = connector.edgeObservers; _b < _c.length; _b++) {
                    var edgeObs = _c[_b];
                    if (edgeObs.equals(this)) {
                        return connector;
                    }
                }
            }
        }
    };
    Edge.prototype.setTarget = function (target) {
        this.target = target;
        this.id = { source: this.source.idCat, target: this.target.idCat };
        this.open = false;
        return true;
    };
    Edge.prototype.getJSON = function () {
        var rtn = {
            source: this.source.idCat,
            target: this.target.idCat,
            kind: this.kind,
            weight: this.weight,
        };
        return rtn;
    };
    return Edge;
}());
exports.Edge = Edge;
