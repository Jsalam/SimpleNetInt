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
                let elements = EdgeFactory._vEdges.filter(function (vE) {
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
                        update: function () {
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
        // this.setColor(vNode.vConnectors[0].color);
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

        let displayEdge = false;
        let alpha;
        // visible only iof the sourec and target are visible
        let sourceTargetVisible;
        if (this.vTarget) {
            sourceTargetVisible = this.vSource.visible && this.vTarget.visible;
        } else {
            sourceTargetVisible = true
        }
        // Visible on mouse over source
        if (this.vSource.mouseIsOver) {
            displayEdge = true;
            alpha = '85';
        }

        // Visible on mouse over target
        if (this.vTarget) {
            if (this.vTarget.mouseIsOver) {
                displayEdge = true;
                alpha = '85';
            }
        }

        // Visible when the connector is selected (propagation)
        let vCnctrSource = this.vSource.vConnectors.filter(vCnctr => vCnctr.connector.kind == this.edge.kind)[0];
        if (vCnctrSource.selected) {
            displayEdge = true;
            alpha = '85';
        }

        if (sourceTargetVisible && DOM.boxChecked('showEdges') || displayEdge) {
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
            let baseColor = ColorFactory.dictionaries.connectors[this.edge.kind];


            if (!baseColor) baseColor = this.vSource.color;

            let strokeColor = this._getStrokeColor(baseColor, alpha);
            let strokeWeight = this._getStrokeWeight(Number(DOM.sliders.edgeTickness.value)); // the parameter attenuates the thickness

            strokeColor = gp5.color(strokeColor);

            if (vCnctrSource.selected) {
                const tr = TransFactory.getTransformerByVClusterID(this.source.idCat.cluster);
                strokeColor.setAlpha(gp5.map(tr.scaleFactor, 1, 0.3, 140, 1));
            }

            this.showBezierArcs(renderer, strokeColor, strokeWeight);

        } else {
            if (this.labelEl) this.labelEl.style.visibility = 'hidden'
        }

    }

    _getStrokeColor(_baseColor, _alpha) {
        let baseColor = _baseColor;

        // default color 
        let strokeColor = baseColor;
        let inPropagation = '#FF0000';
        let alpha;

        if (_alpha) { alpha = _alpha } else { alpha = "10" }

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

    /**
     * 
     * @param {Numeric} factor A value between 1 and 0
     * @returns 
     */
    _getStrokeWeight(factor) {
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
        if (!factor || factor > 1) factor = 1;

        return (strokeWeight * this.edge.weight) * factor;
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
        if (!this.labelEl) {
            this.labelEl = document.createElement('div');
            const canvasContainerEl = document.querySelector('#model');
            if (canvasContainerEl) {
                this.labelEl.style.position = 'absolute';
                this.labelEl.style.left = '0px';
                this.labelEl.style.top = '0px';
                this.labelEl.style.fontFamily = 'Roboto';
                this.labelEl.style.fontSize = '12px';
                this.labelEl.style.overflow = 'hidden';
                this.labelEl.style.pointerEvents = 'none';
                canvasContainerEl.append(this.labelEl);
            }
        }
        this.labelEl.style.color = color;
        this.labelEl.style.transform = `
            translate(${Canvas._offset.x}px, ${Canvas._offset.y}px)
            scale(${Canvas._zoom})
            translate(${10 + (this.controlOrg.x + this.controlEnd.x) / 2}px, ${(this.controlOrg.y + this.controlEnd.y) / 2}px)
        `
        this.labelEl.textContent = this.edge.kind;
        this.labelEl.style.visibility = 'visible'
    }

    dispose() {
        if (this.labelEl) {
            this.labelEl.remove();
        }
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