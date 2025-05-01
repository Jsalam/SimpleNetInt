import { Edge } from "../graphElements/edge";
import { Node } from "../graphElements/node";
import { VNode } from "./vNode";
import { EdgeFactory } from "../factories/edgeFactory";
import { DOM } from "../GUI/DOM/DOMManager";
import anime from "animejs";
import { Canvas } from "../canvas/canvas";
import { CustomEvent, Observer } from "../types";
import p5, { Vector } from "p5";
import { ColorFactory } from "../factories/colorFactory";
import { gp5 } from "../main";
import { TransFactory } from "../factories/transformerFactory";
import { VirtualElementPool } from "./VirtualElementPool";

export class VEdge implements Observer {
  edge: Edge;
  source: Node;
  target: Node | undefined;
  vSource: VNode | undefined;
  vTarget: VNode | undefined;
  color: unknown;
  riseFactor: number;
  controlOrg: Vector | undefined;
  controlEnd: Vector | undefined;

  constructor(edge: Edge) {
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
  fromCanvas(data: CustomEvent) {
    if (data.event instanceof MouseEvent) {
      // DOM event
      if (data.type == "DOMEvent") {
        // get the checkbox
        let DOMelementID = (data.event.target as HTMLInputElement).id;
        let DOMChecked = (data.event.target as HTMLInputElement).checked;
        let elements = EdgeFactory._vEdges.filter(function (vE) {
          if (vE.edge.kind == DOMelementID) {
            return true;
          }
        });
        let rise;
        if (DOMChecked) {
          rise = 0.03;
        } else {
          rise = 0;
        }

        if (DOM.boxChecked("showEdges")) {
          anime({
            // filter all vEdges matching the user selected edge kind
            targets: elements,
            riseFactor: rise,
            easing: "easeInOutSine",
            update: function () {
              Canvas.update();
            },
          });
        } else {
          for (const element of elements) {
            element.riseFactor = rise;
          }

          Canvas.update();
        }
      }
    } else if (data instanceof KeyboardEvent) {
      // do something
    } else {
    }
  }

  setVSource(vNode: VNode) {
    this.vSource = vNode;
    // this.setColor(vNode.vConnectors[0].color);
    this.controlOrg = vNode.pos;
  }

  setVTarget(vNode: VNode) {
    this.vTarget = vNode;
    // vConctr.setColor(this.color);
    this.controlEnd = vNode.pos;
  }

  setColor(color: p5.Color) {
    this.color = color;
  }

  show(renderer: p5) {
    let displayEdge = false;
    let alpha: string;

    // visible only of the source and target are visible
    let sourceTargetVisible = false;
    if (this.vTarget) {
      sourceTargetVisible = this.vSource!.visible! && this.vTarget.visible!;
    } else {
      sourceTargetVisible = this.vSource!.visible!;
    }
    // Visible on mouse over source and the outEdges is selected
    if (this.vSource!.mouseIsOver && DOM.boxChecked("showOutEdges")) {
      displayEdge = true;
      alpha = "85";
    }

    // Visible on mouse over target and the inEdges is selected
    if (this.vTarget) {
      if (this.vTarget.mouseIsOver && DOM.boxChecked("showInEdges")) {
        displayEdge = true;
        alpha = "85";
      }
    }

    // Highligted when the source connector is selected in the GUI menu
    let vCnctrSource = this.vSource!.vConnectors.filter(
      (vCnctr) => vCnctr.connector.kind == this.edge.kind,
    )[0];
    if (vCnctrSource.selected) {
      // displayEdge = true;
      alpha = "85";
    }

    if ((sourceTargetVisible && DOM.boxChecked("showEdges")) || displayEdge) {
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
      let baseColor = ColorFactory.dictionaries.connectors[this.edge.kind!];

      if (!baseColor) baseColor = this.vSource!.color!;

      let strokeColor: string | string[] | p5.Color = this._getStrokeColor( baseColor, alpha!);
      let strokeWeight = this._getStrokeWeight(
        Number(DOM.sliders.edgeTickness.value),
      ); // the parameter attenuates the thickness

      // Handle polymorphism for gp5.color()
      if (typeof strokeColor === "string") {
        strokeColor = gp5.color(strokeColor); // Handle string input
      } else if (Array.isArray(strokeColor)) {
        strokeColor = gp5.color(
          Number.parseInt(strokeColor[0]),
          Number.parseInt(strokeColor[1]),
          Number.parseInt(strokeColor[2]),
          Number.parseInt(strokeColor[3])); // Handle array input
      } else if (strokeColor as any instanceof p5.Color) {
        // Already a p5.Color, no need to convert
      } else {
        console.error("Invalid strokeColor type:", strokeColor);
        strokeColor = gp5.color(0); // Fallback to black
      }

      if (vCnctrSource.selected) {
        const tr = TransFactory.getTransformerByVClusterID(
          this.source.idCat.cluster,
        );
        strokeColor.setAlpha(gp5.map(tr.scaleFactor, 1, 0.3, 140, 1));
      }

      this.showBezierArcs(renderer, strokeColor, strokeWeight);
    } else {
      VirtualElementPool.hide(this, "edge-label");
    }
  }

  _getStrokeColor(_baseColor: string | string[], _alpha: string) {
    let baseColor = _baseColor;

    // default color
    let strokeColor = baseColor;
    let inPropagation = "#FF0000";
    let alpha;

    if (_alpha) {
      alpha = _alpha;
    } else {
      alpha = "10";
    }

    if (DOM.boxChecked("forward") && DOM.boxChecked("backward")) {
      if (
        this.source.inFwdPropagation ||
        (this.edge.target && this.edge.target.inBkwPropagation)
      ) {
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
  _getStrokeWeight(factor: number) {
    // default color
    let strokeWeight = 1;
    let thick = 4;
    let light = 2;

    if (DOM.boxChecked("forward") && DOM.boxChecked("backward")) {
      if (
        this.source.inFwdPropagation ||
        (this.edge.target && this.edge.target.inBkwPropagation)
      ) {
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

    return strokeWeight * this.edge.weight * factor;
  }

  getOrgCoords(vNode: VNode, _kind?: string) {
    let pos: Vector, kind: string;

    if (!_kind) {
      kind = this.edge.kind!;
    }

    let vConnector = vNode.vConnectors.filter(
      (vCnctr) => vCnctr.connector.kind == kind,
    )[0];
    pos = gp5.createVector(vConnector.pos!.x, vConnector.pos!.y);
    return pos;
  }

  showBezierArcs(renderer: p5, color: p5.Color, weight: number) {
    // line thickness
    renderer.strokeWeight(weight);
    renderer.stroke(color);
    renderer.noFill();

    // general properties
    let factor = 1 / 2;
    let org = this.getOrgCoords(this.vSource!);
    let end;

    // If the edge does not have target yet
    if (!this.vTarget) {
      end = gp5.createVector(Canvas._mouse.x, Canvas._mouse.y);
    } else {
      end = this.getOrgCoords(this.vTarget);
    }

    // estimate arm length
    let distBtwnNodes = gp5.dist(org.x, org.y, end.x, org.y);
    let arm = factor * distBtwnNodes;
    // this.riseFactor = 0;

    // set control points
    // when the link direction points to the left
    if (end.x <= org.x) {
      this.controlOrg = gp5.createVector(
        org.x - arm,
        org.y - distBtwnNodes * this.riseFactor,
      );
      this.controlEnd = gp5.createVector(
        end.x + arm,
        end.y - distBtwnNodes * this.riseFactor,
      );
      // this.controlOrg = gp5.createVector(org.x - 25, org.y - (1.5 * distBtwnNodes * this.riseFactor));
      // this.controlEnd = gp5.createVector(end.x + arm * 2, end.y); // - (distBtwnNodes * this.riseFactor));

      // when the link direction points to the right
    } else {
      this.controlOrg = gp5.createVector(
        org.x + arm,
        org.y - distBtwnNodes * this.riseFactor,
      );
      this.controlEnd = gp5.createVector(
        end.x - arm,
        end.y - distBtwnNodes * this.riseFactor,
      );
      // this.controlOrg = gp5.createVector(org.x + 25, org.y - (1.5 * distBtwnNodes * this.riseFactor));
      // this.controlEnd = gp5.createVector(end.x - arm * 2, end.y); // - (distBtwnNodes * this.riseFactor));
    }

    // draw curve
    renderer.beginShape();
    renderer.vertex(org.x, org.y);
    renderer.bezierVertex(
      this.controlOrg.x,
      this.controlOrg.y,
      this.controlEnd.x,
      this.controlEnd.y,
      end.x,
      end.y,
    );
    renderer.vertex(end.x, end.y);
    renderer.endShape();

    // controlpoints
    // renderer.strokeWeight(0.5);
    // renderer.stroke('#FF000030');
    // renderer.line(org.x, org.y, this.controlOrg.x, this.controlOrg.y);
    // renderer.line(end.x, end.y, this.controlEnd.x, this.controlEnd.y);

    // edge label
    if (
      DOM.boxChecked("showTexts") ||
      this.vSource!.mouseIsOver ||
      (this.vTarget && this.vTarget.mouseIsOver)
    ) {

      // get the color in string format
      let colorHex: string = "#ffffff"
      if (color instanceof p5.Color) {
        colorHex = ColorFactory.convertP5ColorToHex(color);
      }

      VirtualElementPool.show(this, "edge-label", this.edge.kind!, {
        fontFamily: "Roboto",
        fontSize: "12px",
        overflow: "hidden",
        display: "block",
        color:  colorHex,
        transform: `
                translate(${Canvas._offset.x}px, ${Canvas._offset.y}px)
                scale(${Canvas._zoom})
                translate(${10 + (this.controlOrg.x + this.controlEnd.x) / 2}px, ${(this.controlOrg.y + this.controlEnd.y) / 2}px)
            `,
      });
    } else {
      VirtualElementPool.hide(this, "edge-label");
    }
  }

  getJSON() {
    let org = this.getOrgCoords(this.vSource!);
    let end = this.getOrgCoords(this.vTarget!);

    let rtn = {
      edge: this.edge.getJSON(),
      vSource: this.vSource!.getJSON(),
      vTarget: this.vTarget!.getJSON(),
      controlPoints: {
        org: [org.x, org.y, org.z],
        orgControl: [
          this.controlOrg!.x,
          this.controlOrg!.y,
          this.controlOrg!.z,
        ],
        endControl: [
          this.controlEnd!.x,
          this.controlEnd!.y,
          this.controlEnd!.z,
        ],
        end: [end.x, end.y, end.z],
      },
    };
    return rtn;
  }
}
