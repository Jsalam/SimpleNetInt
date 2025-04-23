import { Connector } from "../graphElements/connector";
import { Button } from "./button";
import { CustomEvent } from "../types";
import p5, { Vector } from "p5";
import { gp5 } from "../main";

export class VConnector extends Button {
  connector: Connector;
  color: string;

  constructor(connector: Connector) {
    super(0, 0, 10, 10);
    this.connector = connector;
    this.color = "#d4d4d4";
    connector.subscribeVConnector(this);
  }

  // Observing connector
  getData(data: unknown) {
    // do domething
  }

  // Observing to Canvas
  fromVNode(data: CustomEvent) {
    if (data.event instanceof MouseEvent) {
      if (data.type == "mouseup") {
        // do something
      }
      if (data.type == "mousedown") {
        // do something
      }
      if (data.type == "mousedrag") {
        // do something
      }
      if (data.type == "mousemove") {
        this.mouseOver();
      }
      if (data.type == "mousewheel") {
      }
      // do something
    } else if (data.event instanceof KeyboardEvent) {
      // do something
    } else {
      // do something
    }
  }

  setColor(color: string) {
    this.color = color;
  }

  updateCoords(pos: Vector, sequence: number, height: number) {
    this.setPos(
      gp5.createVector(pos.x - this.width, pos.y + sequence * height),
    );
    this.setHeight(height);
    this.setWidth(height);
  }

  updateCoordsByAngle(center: Vector, angle: number, radius: number) {
    let x = Math.cos(angle) * (radius - this.width / 2);
    let y = Math.sin(angle) * (radius - this.width / 2);

    this.setPos(gp5.createVector(center.x + x, center.y + y));
  }

  override show(
    renderer: p5,
    fillColor: p5.Color | string,
    strokeColor: p5.Color | string,
  ) {
    renderer.ellipseMode(gp5.CENTER);
  
    // Fill color
    if (typeof fillColor === "string") {
      fillColor = renderer.color(fillColor);
    }
    renderer.fill(fillColor);
    renderer.stroke(fillColor);

    // Stroke color
    if (typeof strokeColor === "string") {
      strokeColor = renderer.color(strokeColor);
    }
    if (strokeColor) renderer.stroke(strokeColor);
    //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
    // let radius =  * Number(DOM.sliders.nodeSizeFactor.value);
    // if (radius < 3) radius = 3;
    renderer.ellipse(this.pos!.x, this.pos!.y, this.width);
    // label
    // renderer.textSize(5);
    // renderer.textAlign(gp5.RIGHT, gp5.CENTER);
    // renderer.fill('#000000');
    // renderer.noStroke();
    //renderer.text(this.connector.kind, this.pos.x - 2, this.pos.y);
  }

  getJSON() {
    return this.connector.kind;
  }
}
