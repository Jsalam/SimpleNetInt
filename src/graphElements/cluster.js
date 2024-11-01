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

    getNode(index) {
        let rtn = this.nodes.filter(n => {
            return n.idCat.index === index;
        })[0];
        return rtn;
    }

    getConnectors() {
        let rtn = [];
        for (const node of this.nodes) {
            const connectors = node.getConnectors()
            for (const element of connectors) {
                rtn.push(element)
            }
        }
        return (rtn);
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