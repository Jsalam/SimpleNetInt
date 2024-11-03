class Cluster {
    constructor(id, type) {
        this.label;
        this.description;
        this.nodes = [];
        this.id = id;
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
        let rtn = this.nodes.filter(n => {
            return n.idCat.index === index;
        })[0];
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