class VEdge {
    constructor(edge) {
        this.edge = edge;
        this.source = edge.source;
        this.target;
        if (edge.target) {
            this.target = edge.target;
        }
        this.vSource;
        this.vTarget;
        this.color;
        this.alpha = 50
    }

    // Observing to Canvas
    fromCanvas(data) {
        if (data instanceof MouseEvent) {
            // do something
        } else if (data instanceof KeyboardEvent) {
            // do something
        } else {
            // do something
        }
    }

    setVSource(vNode) {
        this.vSource = vNode;
        // this.setColor(vNode..color);
    }

    setVTarget(vNode) {
        this.vTarget = vNode;
        // vConctr.setColor(this.color);
    }

    setColor(color) {
        this.color = color;
    }

    show(renderer) {

        if (DOM.boxChecked("forward") && DOM.boxChecked("backward")) {
            if (this.source.inFwdPropagation || this.edge.target && this.edge.target.inBkwPropagation) {
                renderer.strokeWeight(5);
                this.alpha = '99';
            } else {
                renderer.strokeWeight(3);
                this.alpha = '50';
            }
        } else if (DOM.boxChecked("forward")) {
            if (this.source.inFwdPropagation) {
                renderer.strokeWeight(5);
                this.alpha = '99';
            } else {
                renderer.strokeWeight(3);
                this.alpha = '50';
            }
        } else if (DOM.boxChecked("backward")) {
            if (this.edge.target && this.edge.target.inBkwPropagation) {
                renderer.strokeWeight(5);
                this.alpha = '99';
            } else {
                renderer.strokeWeight(3);
                this.alpha = '50';
            }

        } else {
            renderer.strokeWeight(3);
            this.alpha = '50';
        }
        renderer.strokeWeight(3 * this.edge.weight);
        this.showBeziers(renderer)

    }

    getOrgCoords(vNode, _kind) {
        let pos, kind;

        if (!_kind) {
            kind = this.edge.kind;
        }

        let vConnector = vNode.vConnectors.filter(vCnctr => vCnctr.connector.kind == kind)[0];
        pos = gp5.createVector(vConnector.pos.x, vConnector.pos.y);
        return pos;
    }

    showBeziers(renderer) {

        // If the edge does not have target yet
        if (!this.vTarget) {
            renderer.stroke(this.vSource.color.concat(this.alpha));
            let org = this.getOrgCoords(this.vSource);
            let end = gp5.createVector(Canvas._mouse.x, Canvas._mouse.y);
            let arm = gp5.dist(org.x, org.y, end.x, org.y) / 5;
            renderer.noFill();
            if (end.x <= org.x) {
                renderer.beginShape();
                renderer.vertex(org.x, org.y);
                renderer.vertex(org.x - arm, org.y);
                renderer.bezierVertex(org.x - (3 * arm), org.y, end.x + (3 * arm), end.y, end.x + arm, end.y);
                renderer.vertex(end.x, end.y);
                renderer.endShape();
            } else {
                renderer.beginShape();
                renderer.vertex(org.x, org.y);
                renderer.vertex(org.x + arm, org.y);
                renderer.bezierVertex(org.x + (3 * arm), org.y, end.x - (3 * arm), end.y, end.x - arm, end.y);
                renderer.vertex(end.x, end.y);
                renderer.endShape();
            }
        } else {
            renderer.stroke(this.vSource.color.concat(this.alpha));
            let org = this.getOrgCoords(this.vSource);
            let end = this.getOrgCoords(this.vTarget);;
            let arm = gp5.dist(org.x, org.y, end.x, org.y) / 5;
            renderer.noFill();
            if (end.x <= org.x) {
                renderer.beginShape();
                renderer.vertex(org.x, org.y);
                renderer.vertex(org.x - arm, org.y);
                renderer.bezierVertex(org.x - (3 * arm), org.y, end.x + (3 * arm), end.y, end.x + arm, end.y);
                renderer.vertex(end.x, end.y);
                renderer.endShape();
            } else {
                renderer.beginShape();
                renderer.vertex(org.x, org.y);
                renderer.vertex(org.x + arm, org.y);
                renderer.bezierVertex(org.x + (3 * arm), org.y, end.x - (3 * arm), end.y, end.x - arm, end.y);
                renderer.vertex(end.x, end.y);
                renderer.endShape();
            }
        }

    }
}