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