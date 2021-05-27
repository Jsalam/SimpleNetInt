class Cluster {
    constructor(id) {
        this.label;
        this.description;
        this.nodes = [];
        this.id = id;
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

    getNode(pajekIndex) {
        let rtn = this.nodes.filter(n => {
            return n.idCat.pajekIndex === pajekIndex;
        })[0];
        return rtn;
    }

    getLastNodeId() {
        let rtn = 0;
        let last = this.nodes[this.nodes.length - 1]
        if (last) rtn = last.idCat.index
        return rtn;
    }

    getJSON() {
        let rtn = {
            clusterID: this.id,
            clusterLabel: this.label,
            clusterDescription: this.description,
            nodes: []
        }
        this.nodes.forEach(element => {
            let tmpN = element.getJSON();
            rtn.nodes.push(tmpN);
        });
        return rtn;
    }
}