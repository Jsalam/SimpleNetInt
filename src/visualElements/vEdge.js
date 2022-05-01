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
        // bezier control points
        this.controlOrg;
        this.controlEnd;
    }

    // Observing to Canvas
    fromCanvas(data) {
        if (data.event instanceof MouseEvent) {
            // DOM event
            if (data.type == "DOMEvent") {
                // get the checkbox
                let DOMelementID = data.event.target.id;
                let DOMChecked = data.event.target.checked;
                let elements = EdgeFactory._vEdges.filter(function(vE) {
                    if (vE.edge.kind == DOMelementID) {
                        return true
                    };
                })
                let rise;
                if (DOMChecked) { rise = 0.03 } else { rise = 0 }

                if (DOM.boxChecked('showEdges')) {
                    anime({
                        // filter all vEdges matching the user selected edge kind
                        targets: elements,
                        riseFactor: rise,
                        easing: 'easeInOutSine',
                        update: function() {
                            Canvas.update()
                        }
                    });
                } else {
                    for (const element of elements) {
                        element.riseFactor = rise;
                    }

                    Canvas.update()
                }
            }

        } else if (data instanceof KeyboardEvent) {
            // do something
        } else {

        }
    }

    setVSource(vNode) {
        this.vSource = vNode;
        // this.setColor(vNode..color);
        this.controlOrg = vNode.pos;

    }

    setVTarget(vNode) {
        this.vTarget = vNode;
        // vConctr.setColor(this.color);
        this.controlEnd = vNode.pos;
    }

    setColor(color) {
        this.color = color;
    }

    show(renderer) {
        if (DOM.boxChecked('showEdges')) {
            let vCnctrSource = this.vSource.vConnectors.filter(vCnctr => vCnctr.connector.kind == this.edge.kind)[0];
            //let vCnctrTarget = this.vTarget.vConnectors.filter(vCnctr => vCnctr.connector.kind == this.edge.kind)[0];

            let alpha;

            if (this.vSource.mouseIsOver || vCnctrSource.selected) {
                alpha = '85';
            } else if (this.vTarget) {
                if (this.vTarget.mouseIsOver) {
                    alpha = '85';
                }
            }

            // get stroke color
            let baseColor = ColorFactory.getColorFor(this.edge.kind);
            let strokeColor = this._getStrokeColor(baseColor, alpha);
            let strokeWeight = this._getStrokeWeight();

            strokeColor = gp5.color(strokeColor);

            if (vCnctrSource.selected) {
                const tr = TransFactory.getTransformerByVClusterID(this.source.idCat.cluster);
                strokeColor.setAlpha(gp5.map(tr.scaleFactor, 1, 0.3, 140, 1));
            }

            // this.showBeziers(renderer, strokeColor, strokeWeight);
            this.showBezierArcs(renderer, strokeColor, strokeWeight);

        }
    }

    _getStrokeColor(_baseColor, _alpha) {
        let baseColor = _baseColor;

        // default color 
        let strokeColor = baseColor;
        let inPropagation = '#FF0000';
        let alpha;

        if (_alpha) { alpha = _alpha } else { alpha = "05" }

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
        let thick = 4;
        let light = 2;

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
            this.controlOrg = gp5.createVector(org.x - arm, org.y);
            this.controlEnd = gp5.createVector(end.x + arm, end.y);
            renderer.beginShape();
            renderer.vertex(org.x, org.y);
            renderer.vertex(this.controlOrg.x + (arm * extension), this.controlOrg.y);
            renderer.bezierVertex(this.controlOrg.x, this.controlOrg.y, this.controlEnd.x, this.controlEnd.y, this.controlEnd.x - (arm * extension), end.y);
            renderer.vertex(end.x, end.y);
            renderer.endShape();

        } else {
            this.controlOrg = gp5.createVector(org.x + arm, org.y);
            this.controlEnd = gp5.createVector(end.x - arm, end.y);
            renderer.beginShape();
            renderer.vertex(org.x, org.y);
            renderer.vertex(this.controlOrg.x - (arm * extension), this.controlOrg.y);
            renderer.bezierVertex(this.controlOrg.x, this.controlOrg.y, this.controlEnd.x, this.controlEnd.y, this.controlEnd.x + (arm * extension), end.y);
            renderer.vertex(end.x, end.y);
            renderer.endShape();
        }

        // controlpoints
        renderer.strokeWeight(0.5);
        renderer.stroke('#FF000030');
        renderer.line(org.x, org.y, this.controlOrg.x, this.controlOrg.y);
        renderer.line(end.x, end.y, this.controlEnd.x, this.controlEnd.y);

        // edge label
        renderer.stroke(color);
        renderer.noFill();
        renderer.textSize(12);
        renderer.text(this.edge.kind, 10 + (this.controlOrg.x + this.controlEnd.x) / 2, (this.controlOrg.y + this.controlEnd.y) / 2);

    }

    showBezierArcs(renderer, color, weight) {

        // line thickness
        renderer.strokeWeight(weight);
        renderer.stroke(color);
        renderer.noFill();

        // general properties
        let factor = 1 / 2;
        let org = this.getOrgCoords(this.vSource);
        let end;

        // If the edge does not have target yet
        if (!this.vTarget) {
            end = gp5.createVector(Canvas._mouse.x, Canvas._mouse.y);
        } else {
            end = this.getOrgCoords(this.vTarget);
        }

        // estimate arm length
        let distBtwnNodes = gp5.dist(org.x, org.y, end.x, org.y)
        let arm = factor * distBtwnNodes;
        // this.riseFactor = 0;

        // set control points
        // when the link direction points to the left
        if (end.x <= org.x) {
            this.controlOrg = gp5.createVector(org.x - arm, org.y - (distBtwnNodes * this.riseFactor));
            this.controlEnd = gp5.createVector(end.x + arm, end.y - (distBtwnNodes * this.riseFactor));
            // this.controlOrg = gp5.createVector(org.x - 25, org.y - (1.5 * distBtwnNodes * this.riseFactor));
            // this.controlEnd = gp5.createVector(end.x + arm * 2, end.y); // - (distBtwnNodes * this.riseFactor));

            // when the link direction points to the right
        } else {
            this.controlOrg = gp5.createVector(org.x + arm, org.y - (distBtwnNodes * this.riseFactor));
            this.controlEnd = gp5.createVector(end.x - arm, end.y - (distBtwnNodes * this.riseFactor));
            // this.controlOrg = gp5.createVector(org.x + 25, org.y - (1.5 * distBtwnNodes * this.riseFactor));
            // this.controlEnd = gp5.createVector(end.x - arm * 2, end.y); // - (distBtwnNodes * this.riseFactor));
        }

        // draw curve
        renderer.beginShape();
        renderer.vertex(org.x, org.y);
        renderer.bezierVertex(this.controlOrg.x, this.controlOrg.y, this.controlEnd.x, this.controlEnd.y, end.x, end.y);
        renderer.vertex(end.x, end.y);
        renderer.endShape();

        // controlpoints
        // renderer.strokeWeight(0.5);
        // renderer.stroke('#FF000030');
        // renderer.line(org.x, org.y, this.controlOrg.x, this.controlOrg.y);
        // renderer.line(end.x, end.y, this.controlEnd.x, this.controlEnd.y);

        // edge label

        renderer.noStroke();
        renderer.fill(color);
        renderer.textAlign(renderer.LEFT, renderer.TOP);
        renderer.textSize(12);
        renderer.text(this.edge.kind, 10 + (this.controlOrg.x + this.controlEnd.x) / 2, (this.controlOrg.y + this.controlEnd.y) / 2);
    }

    getJSON() {
        let org = this.getOrgCoords(this.vSource);
        let end = this.getOrgCoords(this.vTarget);

        let rtn = {
            "edge": this.edge.getJSON(),
            "vSource": this.vSource.getJSON(),
            "vTarget": this.vTarget.getJSON(),
            "controlPoints": {
                "org": [
                    org.x,
                    org.y,
                    org.z
                ],
                "orgControl": [
                    this.controlOrg.x,
                    this.controlOrg.y,
                    this.controlOrg.z
                ],
                "endControl": [
                    this.controlEnd.x,
                    this.controlEnd.y,
                    this.controlEnd.z
                ],
                "end": [
                    end.x,
                    end.y,
                    end.z
                ],
            }
        }
        return rtn;
    }
}