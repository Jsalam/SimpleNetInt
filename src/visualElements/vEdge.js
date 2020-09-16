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
        this.riseFactor = 0;
    }

    // Observing to Canvas
    fromCanvas(data) {
        if (data.event instanceof MouseEvent) {
            // DOM event
            if (data.type == "DOMEvent") {
                // get the checkbox
                let DOMelementID = data.event.target.id;
                let DOMChecked = data.event.target.checked;
                let rise;
                if (DOMChecked) { rise = 0.5 } else { rise = 0 }
                anime({
                    // filter all vEdges matching the user selected edge kind
                    targets: EdgeFactory._vEdges.filter(function(vE) {
                        if (vE.edge.kind == DOMelementID) return true;
                    }),
                    riseFactor: rise,
                    easing: 'easeInOutSine',
                    update: function() {
                        Canvas.update()
                    }
                });
            }

        } else if (data instanceof KeyboardEvent) {
            // do something
        } else {

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
        // get stroke color
        let strokeColor = this._getStrokeColor(this.vSource.color)
        let strokeWeight = this._getStrokeWeight();

        //this.showBeziers(renderer, strokeColor, strokeWeight);
        this.showBezierArcs(renderer, strokeColor, strokeWeight);

    }

    _getStrokeColor(baseColor) {
        // default color 
        let strokeColor = baseColor;
        let inPropagation = '#FF0000';
        let alpha = '80'

        if (DOM.boxChecked("forward") && DOM.boxChecked("backward")) {
            if (this.source.inFwdPropagation || this.edge.target && this.edge.target.inBkwPropagation) {
                strokeColor = inPropagation;
            } else {
                strokeColor = baseColor;
            }
        } else if (DOM.boxChecked("forward")) {
            if (this.source.inFwdPropagation) {
                strokeColor = inPropagation;
            } else {
                strokeColor = baseColor;
            }
        } else if (DOM.boxChecked("backward")) {
            if (this.edge.target && this.edge.target.inBkwPropagation) {
                strokeColor = inPropagation;
            } else {
                strokeColor = baseColor;
            }

        } else {
            strokeColor = baseColor;
        }

        return strokeColor.concat(alpha);
    }

    _getStrokeWeight() {
        // default color 
        let strokeWeight = 1;
        let thick = 5;
        let light = 3

        if (DOM.boxChecked("forward") && DOM.boxChecked("backward")) {
            if (this.source.inFwdPropagation || this.edge.target && this.edge.target.inBkwPropagation) {
                strokeWeight = thick;
            } else {
                strokeWeight = light;
            }
        } else if (DOM.boxChecked("forward")) {
            if (this.source.inFwdPropagation) {
                strokeWeight = thick;
            } else {
                strokeWeight = light;
            }
        } else if (DOM.boxChecked("backward")) {
            if (this.edge.target && this.edge.target.inBkwPropagation) {
                strokeWeight = thick;
            } else {
                strokeWeight = light;
            }

        } else {
            strokeWeight = light;
        }

        return strokeWeight * this.edge.weight;
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

    showBeziers(renderer, color, weight) {

        // line thickness
        renderer.strokeWeight(weight);
        renderer.stroke(color);
        renderer.noFill();

        // general properties
        let factor = 3; // the propotion of distance between nodes
        let controlOrg;
        let controlEnd;
        let org = this.getOrgCoords(this.vSource);
        let end;


        // If the edge does not have target yet
        if (!this.vTarget) {
            end = gp5.createVector(Canvas._mouse.x, Canvas._mouse.y);
        } else {
            end = this.getOrgCoords(this.vTarget);;
        }

        // estimate arm length
        let extension = 0.7;
        let arm = factor * gp5.dist(org.x, org.y, end.x, org.y) / 5;

        // set control points
        if (end.x <= org.x) {
            controlOrg = gp5.createVector(org.x - arm, org.y);
            controlEnd = gp5.createVector(end.x + arm, end.y);
            renderer.beginShape();
            renderer.vertex(org.x, org.y);
            renderer.vertex(controlOrg.x + (arm * extension), controlOrg.y);
            renderer.bezierVertex(controlOrg.x, controlOrg.y, controlEnd.x, controlEnd.y, controlEnd.x - (arm * extension), end.y);
            renderer.vertex(end.x, end.y);
            renderer.endShape();

        } else {
            controlOrg = gp5.createVector(org.x + arm, org.y);
            controlEnd = gp5.createVector(end.x - arm, end.y);
            renderer.beginShape();
            renderer.vertex(org.x, org.y);
            renderer.vertex(controlOrg.x - (arm * extension), controlOrg.y);
            renderer.bezierVertex(controlOrg.x, controlOrg.y, controlEnd.x, controlEnd.y, controlEnd.x + (arm * extension), end.y);
            renderer.vertex(end.x, end.y);
            renderer.endShape();
        }

        // controlpoints
        renderer.strokeWeight(0.5);
        renderer.stroke('#FF0000');
        renderer.line(org.x, org.y, controlOrg.x, controlOrg.y);
        renderer.line(end.x, end.y, controlEnd.x, controlEnd.y);

    }

    showBezierArcs(renderer, color, weight) {

        // line thickness
        renderer.strokeWeight(weight);
        renderer.stroke(color);
        renderer.noFill();

        // general properties
        let factor = 1 / 8;
        let controlOrg;
        let controlEnd;
        let org = this.getOrgCoords(this.vSource);
        let end;

        // If the edge does not have target yet
        if (!this.vTarget) {
            end = gp5.createVector(Canvas._mouse.x, Canvas._mouse.y);
        } else {
            end = this.getOrgCoords(this.vTarget);;
        }

        // estimate arm length
        let gap = gp5.dist(org.x, org.y, end.x, org.y)
        let arm = factor * gap;
        // this.riseFactor = 0;

        // set control points
        if (end.x <= org.x) {
            controlOrg = gp5.createVector(org.x - arm, org.y - (gap * this.riseFactor));
            controlEnd = gp5.createVector(end.x + arm, end.y - (gap * this.riseFactor));

        } else {
            // controlOrg = gp5.createVector(org.x + arm, org.y);
            // controlEnd = gp5.createVector(end.x - arm, end.y);
            controlOrg = gp5.createVector(org.x + arm, org.y - (gap * this.riseFactor));
            controlEnd = gp5.createVector(end.x - arm, end.y - (gap * this.riseFactor));
        }

        // draw curve
        renderer.beginShape();
        renderer.vertex(org.x, org.y);
        renderer.bezierVertex(controlOrg.x, controlOrg.y, controlEnd.x, controlEnd.y, end.x, end.y);
        renderer.vertex(end.x, end.y);
        renderer.endShape();

        // controlpoints
        renderer.strokeWeight(0.5);
        renderer.stroke('#FF0000');
        renderer.line(org.x, org.y, controlOrg.x, controlOrg.y);
        renderer.line(end.x, end.y, controlEnd.x, controlEnd.y);

    }
}