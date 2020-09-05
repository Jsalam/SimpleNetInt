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
        this.open = false;
        this.alpha = 50
    }

    setVSource(vConctr) {
        this.vSource = vConctr;
        this.setColor(vConctr.color);
    }

    setVTarget(vConctr) {
        this.vTarget = vConctr;
        vConctr.setColor(this.color);
    }

    setColor(color) {
        this.color = color;
    }

    show(builder) {

        if (document.getElementById("forward").checked && document.getElementById("backward").checked) {
            if (this.source.nodeObserver.inFwdPropagation || this.edge.target && this.edge.target.nodeObserver.inBkwPropagation) {
                builder.strokeWeight(5);
                this.alpha = '99';
            } else {
                builder.strokeWeight(3);
                this.alpha = '50';
            }
        } else if (document.getElementById("forward").checked) {
            if (this.source.nodeObserver.inFwdPropagation) {
                builder.strokeWeight(5);
                this.alpha = '99';
            } else {
                builder.strokeWeight(3);
                this.alpha = '50';
            }
        } else if (document.getElementById("backward").checked) {
            if (this.edge.target && this.edge.target.nodeObserver.inBkwPropagation) {
                builder.strokeWeight(5);
                this.alpha = '99';
            } else {
                builder.strokeWeight(3);
                this.alpha = '50';
            }

        } else {
            builder.strokeWeight(3);
            this.alpha = '50';
        }
        builder.strokeWeight(3);
        this.showBeziers(builder)

    }

    showBeziers(builder) {

        // If the edge does not have target yet
        if (!this.vTarget) {
            builder.stroke(this.vSource.color.concat(this.alpha));
            let org = gp5.createVector(this.vSource.pos.x + (this.vSource.width / 2), this.vSource.pos.y + (this.vSource.height / 2));
            let end = gp5.createVector(gp5.mouseX, gp5.mouseY);
            let arm = gp5.dist(org.x, org.y, end.x, org.y) / 5;
            builder.noFill();
            if (end.x <= org.x) {
                builder.beginShape();
                builder.vertex(org.x, org.y);
                builder.vertex(org.x - arm, org.y);
                builder.bezierVertex(org.x - (3 * arm), org.y, end.x + (3 * arm), end.y, end.x + arm, end.y);
                builder.vertex(end.x, end.y);
                builder.endShape();
            } else {
                builder.beginShape();
                builder.vertex(org.x, org.y);
                builder.vertex(org.x + arm, org.y);
                builder.bezierVertex(org.x + (3 * arm), org.y, end.x - (3 * arm), end.y, end.x - arm, end.y);
                builder.vertex(end.x, end.y);
                builder.endShape();
            }
        } else {
            builder.stroke(this.vSource.color.concat(this.alpha));
            let org = gp5.createVector(this.vSource.pos.x + (this.vSource.width / 2), this.vSource.pos.y + (this.vSource.height / 2));
            let end = gp5.createVector(this.vTarget.pos.x + (this.vTarget.width / 2), this.vTarget.pos.y + (this.vTarget.height / 2));
            let arm = gp5.dist(org.x, org.y, end.x, org.y) / 5;
            builder.noFill();
            if (end.x <= org.x) {
                builder.beginShape();
                builder.vertex(org.x, org.y);
                builder.vertex(org.x - arm, org.y);
                builder.bezierVertex(org.x - (3 * arm), org.y, end.x + (3 * arm), end.y, end.x + arm, end.y);
                builder.vertex(end.x, end.y);
                builder.endShape();
            } else {
                builder.beginShape();
                builder.vertex(org.x, org.y);
                builder.vertex(org.x + arm, org.y);
                builder.bezierVertex(org.x + (3 * arm), org.y, end.x - (3 * arm), end.y, end.x - arm, end.y);
                builder.vertex(end.x, end.y);
                builder.endShape();
            }
        }

    }
}