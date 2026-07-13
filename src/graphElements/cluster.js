"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cluster = void 0;
class Cluster {
    timestamps;
    dimensions;
    lookupTable;
    label;
    description;
    nodes;
    id;
    type;
    constructor(id, type, timestamps = [], dimensions = { name: "", children: [] }, lookupTable) {
        this.timestamps = timestamps;
        this.dimensions = dimensions;
        this.lookupTable = lookupTable;
        this.description;
        this.lookupTable;
        this.id = id;
        this.label;
        this.nodes = [];
        this.type = type;
    }
    addNode(cat) {
        this.nodes.push(cat);
    }
    setLabel(label) {
        this.label = label;
    }
    setDescription(text) {
        this.description = text;
    }
    getNode(index) {
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
    equals(cluster) {
        return this.id === cluster.id;
    }
    getJSON() {
        let rtn = {
            clusterID: this.id,
            clusterLabel: this.label,
            clusterDescription: this.description,
            nodes: [],
        };
        this.nodes.forEach((element) => {
            let tmpN = element.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    }
}
exports.Cluster = Cluster;
//# sourceMappingURL=cluster.js.map