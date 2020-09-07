class Edge {
    constructor(source) {
        this.source = source;
        // the kind is set in connector class where the edge is subscribed to the connector
        this.kind;
        this.target;
        this.id;
        this.open = true;
        this.weight = 1;
    }

    setWeight(val) {
        this.weight = val;
    }

    increaseWeight() {
        this.weight++;
    }

    decreaseWeight() {
        if (this.weight > 1) {
            this.weight--;
        }
    }

    setTarget(target) {
        this.target = target;
        this.id = { 'source': this.source.idCat, 'target': this.target.idCat, 'weight': this.weight };
        return true;
    }
}