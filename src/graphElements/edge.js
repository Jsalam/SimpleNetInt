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

    equals(edgeA) {
        let A, B;
        let rtn = false;

        if (edgeA.target) {
            A = [edgeA.source.idCat.pajekIndex, edgeA.target.idCat.pajekIndex];
        } else {
            A = [edgeA.source.idCat.pajekIndex, undefined];
        }
        if (this.target) {
            B = [this.source.idCat.pajekIndex, this.target.idCat.pajekIndex];
        } else {
            B = [this.source.idCat.pajekIndex, undefined];
        }
        rtn = (A[0] === B[0] && A[1] === B[1]);

        if (rtn) {
            rtn = edgeA.kind === this.kind;
        }

        return rtn;
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

    getSourceConnector() {
        for (const connector of this.source.connectors) {
            for (const edgeObs of connector.edgeObservers) {
                if (edgeObs.equals(this)) {
                    return connector;
                }
            }
        }
    }

    getTargetConnector() {
        if (this.target) {
            for (const connector of this.target.connectors) {
                for (const edgeObs of connector.edgeObservers) {
                    if (edgeObs.equals(this)) {
                        return connector;
                    }
                }
            }
        }
    }

    setTarget(target) {
        this.target = target;
        this.id = { 'source': this.source.idCat, 'target': this.target.idCat };
        return true;
    }

    getJSON() {
        let rtn = {
            source: this.source.idCat,
            target: this.target.idCat,
            kind: this.kind,
            weight: this.weight
        }
        return rtn;
    }
}