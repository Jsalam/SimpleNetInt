class Edge {
    constructor(source) {
        this.source = source
        this.target;
        this.id;
        this.open = true;
        this.weight = 1;
        //console.log("new edge from " + this.source.id);
    }

    setWeight(val){
        this.weight = val;
    }

    increaseWeight(){
        this.weight++;
    }

    setTarget(target) {
        if (target.polarity != this.source.polarity) {
            this.target = target;
            this.id = { 'source': this.source.id, 'target': this.target.id, 'weight':this.weight };
            return true;
        } else {
            console.log("Impossible edge. Connectors with same polarity");
            edges.slice(-1)[0].source.connectorTaken = false;
            edges.pop();
            return false;
        }
    }
}