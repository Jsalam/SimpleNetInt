"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEdge = void 0;
const edgeFactory_1 = require("../factories/edgeFactory");
const DOMManager_1 = require("../GUI/DOM/DOMManager");
const animejs_1 = __importDefault(require("animejs"));
const canvas_1 = require("../canvas/canvas");
const p5_1 = __importDefault(require("p5"));
const colorFactory_1 = require("../factories/colorFactory");
const main_1 = require("../main");
const transformerFactory_1 = require("../factories/transformerFactory");
const VirtualElementPool_1 = require("./VirtualElementPool");
class VEdge {
    edge;
    source;
    target;
    vSource;
    vTarget;
    color;
    riseFactor;
    controlOrg;
    controlEnd;
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
                let elements = edgeFactory_1.EdgeFactory._vEdges.filter(function (vE) {
                    if (vE.edge.kind == DOMelementID) {
                        return true;
                    }
                });
                let rise;
                if (DOMChecked) {
                    rise = 0.03;
                }
                else {
                    rise = 0;
                }
                if (DOMManager_1.DOM.boxChecked("showEdges")) {
                    (0, animejs_1.default)({
                        // filter all vEdges matching the user selected edge kind
                        targets: elements,
                        riseFactor: rise,
                        easing: "easeInOutSine",
                        update: function () {
                            canvas_1.Canvas.update();
                        },
                    });
                }
                else {
                    for (const element of elements) {
                        element.riseFactor = rise;
                    }
                    canvas_1.Canvas.update();
                }
            }
        }
        else if (data instanceof KeyboardEvent) {
            // do something
        }
        else {
        }
        return false;
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
        // visible only of the source and target are visible
        let sourceTargetVisible = false;
        if (this.vTarget) {
            sourceTargetVisible = this.vSource.visible && this.vTarget.visible;
        }
        else {
            sourceTargetVisible = this.vSource.visible;
        }
        // Visible on mouse over source and the outEdges is selected
        if (this.vSource.mouseIsOver && DOMManager_1.DOM.boxChecked("showOutEdges")) {
            displayEdge = true;
            alpha = "85";
        }
        // Visible on mouse over target and the inEdges is selected
        if (this.vTarget) {
            if (this.vTarget.mouseIsOver && DOMManager_1.DOM.boxChecked("showInEdges")) {
                displayEdge = true;
                alpha = "85";
            }
        }
        // Highligted when the source connector is selected in the GUI menu
        let vCnctrSource = this.vSource.vConnectors.filter((vCnctr) => vCnctr.connector.kind == this.edge.kind)[0];
        if (vCnctrSource.selected) {
            // displayEdge = true;
            alpha = "85";
        }
        if ((sourceTargetVisible && DOMManager_1.DOM.boxChecked("showEdges")) || displayEdge) {
            //let vCnctrSource = this.vSource.vConnectors.filter(vCnctr => vCnctr.connector.kind == this.edge.kind)[0];
            //let vCnctrTarget = this.vTarget.vConnectors.filter(vCnctr => vCnctr.connector.kind == this.edge.kind)[0];
            // let alpha;
            // if (this.vSource.mouseIsOver || vCnctrSource.selected) {
            //     alpha = '85';
            // } else if (this.vTarget) {
            //     if (this.vTarget.mouseIsOver) {
            //         alpha = '85';
            //     }
            // }
            // get stroke color
            let baseColor = colorFactory_1.ColorFactory.dictionaries.connectors[this.edge.kind];
            if (!baseColor)
                baseColor = this.vSource.color;
            let strokeColor = this._getStrokeColor(baseColor, alpha);
            let strokeWeight = this._getStrokeWeight(Number(DOMManager_1.DOM.sliders.edgeTickness.value)); // the parameter attenuates the thickness
            // Handle polymorphism for gp5.color()
            if (typeof strokeColor === "string") {
                strokeColor = main_1.gp5.color(strokeColor); // Handle string input
            }
            else if (Array.isArray(strokeColor)) {
                strokeColor = main_1.gp5.color(Number.parseInt(strokeColor[0]), Number.parseInt(strokeColor[1]), Number.parseInt(strokeColor[2]), Number.parseInt(strokeColor[3])); // Handle array input
            }
            else if (strokeColor instanceof p5_1.default.Color) {
                // Already a p5.Color, no need to convert
            }
            else {
                console.error("Invalid strokeColor type:", strokeColor);
                strokeColor = main_1.gp5.color(0); // Fallback to black
            }
            if (vCnctrSource.selected) {
                const tr = transformerFactory_1.TransFactory.getTransformerByVClusterID(this.source.idCat.cluster);
                strokeColor.setAlpha(main_1.gp5.map(tr.scaleFactor, 1, 0.3, 140, 1));
            }
            this.showBezierArcs(renderer, strokeColor, strokeWeight);
        }
        else {
            VirtualElementPool_1.VirtualElementPool.hide(this, "edge-label");
        }
    }
    _getStrokeColor(_baseColor, _alpha) {
        let baseColor = _baseColor;
        // default color
        let strokeColor = baseColor;
        let inPropagation = "#FF0000";
        let alpha;
        if (_alpha) {
            alpha = _alpha;
        }
        else {
            alpha = "10";
        }
        if (DOMManager_1.DOM.boxChecked("forward") && DOMManager_1.DOM.boxChecked("backward")) {
            if (this.source.inFwdPropagation ||
                (this.edge.target && this.edge.target.inBkwPropagation)) {
                strokeColor = inPropagation;
            }
            else {
                strokeColor = baseColor;
            }
        }
        else if (DOMManager_1.DOM.boxChecked("forward")) {
            if (this.source.inFwdPropagation) {
                strokeColor = inPropagation;
            }
            else {
                strokeColor = baseColor;
            }
        }
        else if (DOMManager_1.DOM.boxChecked("backward")) {
            if (this.edge.target && this.edge.target.inBkwPropagation) {
                strokeColor = inPropagation;
            }
            else {
                strokeColor = baseColor;
            }
        }
        else {
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
        if (DOMManager_1.DOM.boxChecked("forward") && DOMManager_1.DOM.boxChecked("backward")) {
            if (this.source.inFwdPropagation ||
                (this.edge.target && this.edge.target.inBkwPropagation)) {
                strokeWeight = thick;
            }
            else {
                strokeWeight = light;
            }
        }
        else if (DOMManager_1.DOM.boxChecked("forward")) {
            if (this.source.inFwdPropagation) {
                strokeWeight = thick;
            }
            else {
                strokeWeight = light;
            }
        }
        else if (DOMManager_1.DOM.boxChecked("backward")) {
            if (this.edge.target && this.edge.target.inBkwPropagation) {
                strokeWeight = thick;
            }
            else {
                strokeWeight = light;
            }
        }
        else {
            strokeWeight = light;
        }
        if (!factor || factor > 1)
            factor = 1;
        return strokeWeight * this.edge.weight * factor;
    }
    getOrgCoords(vNode, _kind) {
        let pos, kind;
        if (!_kind) {
            kind = this.edge.kind;
        }
        let vConnector = vNode.vConnectors.filter((vCnctr) => vCnctr.connector.kind == kind)[0];
        pos = main_1.gp5.createVector(vConnector.pos.x, vConnector.pos.y);
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
            end = main_1.gp5.createVector(canvas_1.Canvas._mouse.x, canvas_1.Canvas._mouse.y);
        }
        else {
            end = this.getOrgCoords(this.vTarget);
        }
        // estimate arm length
        let distBtwnNodes = main_1.gp5.dist(org.x, org.y, end.x, org.y);
        let arm = factor * distBtwnNodes;
        // this.riseFactor = 0;
        // set control points
        // when the link direction points to the left
        if (end.x <= org.x) {
            this.controlOrg = main_1.gp5.createVector(org.x - arm, org.y - distBtwnNodes * this.riseFactor);
            this.controlEnd = main_1.gp5.createVector(end.x + arm, end.y - distBtwnNodes * this.riseFactor);
            // this.controlOrg = gp5.createVector(org.x - 25, org.y - (1.5 * distBtwnNodes * this.riseFactor));
            // this.controlEnd = gp5.createVector(end.x + arm * 2, end.y); // - (distBtwnNodes * this.riseFactor));
            // when the link direction points to the right
        }
        else {
            this.controlOrg = main_1.gp5.createVector(org.x + arm, org.y - distBtwnNodes * this.riseFactor);
            this.controlEnd = main_1.gp5.createVector(end.x - arm, end.y - distBtwnNodes * this.riseFactor);
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
        if (DOMManager_1.DOM.boxChecked("showTexts") ||
            this.vSource.mouseIsOver ||
            (this.vTarget && this.vTarget.mouseIsOver)) {
            // get the color in string format
            let colorHex = "#ffffff";
            if (color instanceof p5_1.default.Color) {
                colorHex = colorFactory_1.ColorFactory.convertP5ColorToHex(color);
            }
            VirtualElementPool_1.VirtualElementPool.show(this, "edge-label", this.edge.kind, {
                fontFamily: "Roboto",
                fontSize: "12px",
                overflow: "hidden",
                display: "block",
                color: colorHex,
                transform: `
                translate(${canvas_1.Canvas._offset.x}px, ${canvas_1.Canvas._offset.y}px)
                scale(${canvas_1.Canvas._zoom})
                translate(${10 + (this.controlOrg.x + this.controlEnd.x) / 2}px, ${(this.controlOrg.y + this.controlEnd.y) / 2}px)
            `,
            });
        }
        else {
            VirtualElementPool_1.VirtualElementPool.hide(this, "edge-label");
        }
    }
    getJSON() {
        let org = this.getOrgCoords(this.vSource);
        let end = this.getOrgCoords(this.vTarget);
        let rtn = {
            edge: this.edge.getJSON(),
            vSource: this.vSource.getJSON(),
            vTarget: this.vTarget.getJSON(),
            controlPoints: {
                org: [org.x, org.y, org.z],
                orgControl: [
                    this.controlOrg.x,
                    this.controlOrg.y,
                    this.controlOrg.z,
                ],
                endControl: [
                    this.controlEnd.x,
                    this.controlEnd.y,
                    this.controlEnd.z,
                ],
                end: [end.x, end.y, end.z],
            },
        };
        return rtn;
    }
}
exports.VEdge = VEdge;
//# sourceMappingURL=vEdge.js.map