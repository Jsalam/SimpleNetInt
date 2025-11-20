"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEdge = void 0;
var edgeFactory_1 = require("../factories/edgeFactory");
var DOMManager_1 = require("../GUI/DOM/DOMManager");
var animejs_1 = require("animejs");
var canvas_1 = require("../canvas/canvas");
var p5_1 = require("p5");
var colorFactory_1 = require("../factories/colorFactory");
var main_1 = require("../main");
var transformerFactory_1 = require("../factories/transformerFactory");
var VirtualElementPool_1 = require("./VirtualElementPool");
var VEdge = /** @class */ (function () {
    function VEdge(edge) {
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
    VEdge.prototype.fromCanvas = function (data) {
        if (data.event instanceof MouseEvent) {
            // DOM event
            if (data.type == "DOMEvent") {
                // get the checkbox
                var DOMelementID_1 = data.event.target.id;
                var DOMChecked = data.event.target.checked;
                var elements = edgeFactory_1.EdgeFactory._vEdges.filter(function (vE) {
                    if (vE.edge.kind == DOMelementID_1) {
                        return true;
                    }
                });
                var rise = void 0;
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
                    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                        var element = elements_1[_i];
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
    };
    VEdge.prototype.setVSource = function (vNode) {
        this.vSource = vNode;
        // this.setColor(vNode.vConnectors[0].color);
        this.controlOrg = vNode.pos;
    };
    VEdge.prototype.setVTarget = function (vNode) {
        this.vTarget = vNode;
        // vConctr.setColor(this.color);
        this.controlEnd = vNode.pos;
    };
    VEdge.prototype.setColor = function (color) {
        this.color = color;
    };
    VEdge.prototype.show = function (renderer) {
        var _this = this;
        var displayEdge = false;
        var alpha;
        // visible only of the source and target are visible
        var sourceTargetVisible = false;
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
        var vCnctrSource = this.vSource.vConnectors.filter(function (vCnctr) { return vCnctr.connector.kind == _this.edge.kind; })[0];
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
            var baseColor = colorFactory_1.ColorFactory.dictionaries.connectors[this.edge.kind];
            if (!baseColor)
                baseColor = this.vSource.color;
            var strokeColor = this._getStrokeColor(baseColor, alpha);
            var strokeWeight = this._getStrokeWeight(Number(DOMManager_1.DOM.sliders.edgeTickness.value)); // the parameter attenuates the thickness
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
                var tr = transformerFactory_1.TransFactory.getTransformerByVClusterID(this.source.idCat.cluster);
                strokeColor.setAlpha(main_1.gp5.map(tr.scaleFactor, 1, 0.3, 140, 1));
            }
            this.showBezierArcs(renderer, strokeColor, strokeWeight);
        }
        else {
            VirtualElementPool_1.VirtualElementPool.hide(this, "edge-label");
        }
    };
    VEdge.prototype._getStrokeColor = function (_baseColor, _alpha) {
        var baseColor = _baseColor;
        // default color
        var strokeColor = baseColor;
        var inPropagation = "#FF0000";
        var alpha;
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
    };
    /**
     *
     * @param {Numeric} factor A value between 1 and 0
     * @returns
     */
    VEdge.prototype._getStrokeWeight = function (factor) {
        // default color
        var strokeWeight = 1;
        var thick = 4;
        var light = 2;
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
    };
    VEdge.prototype.getOrgCoords = function (vNode, _kind) {
        var pos, kind;
        if (!_kind) {
            kind = this.edge.kind;
        }
        var vConnector = vNode.vConnectors.filter(function (vCnctr) { return vCnctr.connector.kind == kind; })[0];
        pos = main_1.gp5.createVector(vConnector.pos.x, vConnector.pos.y);
        return pos;
    };
    VEdge.prototype.showBezierArcs = function (renderer, color, weight) {
        // line thickness
        renderer.strokeWeight(weight);
        renderer.stroke(color);
        renderer.noFill();
        // general properties
        var factor = 1 / 2;
        var org = this.getOrgCoords(this.vSource);
        var end;
        // If the edge does not have target yet
        if (!this.vTarget) {
            end = main_1.gp5.createVector(canvas_1.Canvas._mouse.x, canvas_1.Canvas._mouse.y);
        }
        else {
            end = this.getOrgCoords(this.vTarget);
        }
        // estimate arm length
        var distBtwnNodes = main_1.gp5.dist(org.x, org.y, end.x, org.y);
        var arm = factor * distBtwnNodes;
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
            var colorHex = "#ffffff";
            if (color instanceof p5_1.default.Color) {
                colorHex = colorFactory_1.ColorFactory.convertP5ColorToHex(color);
            }
            VirtualElementPool_1.VirtualElementPool.show(this, "edge-label", this.edge.kind, {
                fontFamily: "Roboto",
                fontSize: "12px",
                overflow: "hidden",
                display: "block",
                color: colorHex,
                transform: "\n                translate(".concat(canvas_1.Canvas._offset.x, "px, ").concat(canvas_1.Canvas._offset.y, "px)\n                scale(").concat(canvas_1.Canvas._zoom, ")\n                translate(").concat(10 + (this.controlOrg.x + this.controlEnd.x) / 2, "px, ").concat((this.controlOrg.y + this.controlEnd.y) / 2, "px)\n            "),
            });
        }
        else {
            VirtualElementPool_1.VirtualElementPool.hide(this, "edge-label");
        }
    };
    VEdge.prototype.getJSON = function () {
        var org = this.getOrgCoords(this.vSource);
        var end = this.getOrgCoords(this.vTarget);
        var rtn = {
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
    };
    return VEdge;
}());
exports.VEdge = VEdge;
