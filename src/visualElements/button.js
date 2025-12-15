"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const main_1 = require("../main");
const canvas_1 = require("../canvas/canvas");
/**
 * Base class for nodes, connectors or any other visual element with an area.
 */
class Button {
    pos;
    width;
    height;
    mouseIsOver;
    clicked;
    dragged;
    delta;
    selected;
    transformed;
    localScale;
    visible;
    constructor(posX, posY, width, height) {
        this.pos = main_1.gp5.createVector(posX, posY, 0);
        this.width = width;
        this.height = height;
        this.mouseIsOver = false;
        this.clicked = false;
        this.dragged = false;
        this.delta = undefined;
        this.selected = false;
        // this is true when the Transformer has affected the coordinates of this object. It turns to false when the Tranformer has been reset.
        this.transformed = false;
        this.localScale = 1;
        this.visible = true;
    }
    show(renderer, fillColor, strokeColor) {
        if (!this.mouseIsOver) {
            main_1.gp5.noFill();
        }
        else {
            main_1.gp5.fill("#F0F0F080");
        }
        main_1.gp5.rect(this.pos.x, this.pos.y, this.width, this.height);
    }
    setPos(pos) {
        this.pos = pos;
    }
    setX(xpos) {
        this.pos.x = xpos;
    }
    setY(ypos) {
        this.pos.y = ypos;
    }
    setHeight(h) {
        this.height = h;
    }
    setWidth(w) {
        this.width = w;
    }
    mouseOver(data) {
        const mousWasOver = this.mouseIsOver;
        if (this.visible) {
            this.mouseIsOver = false;
            if (canvas_1.Canvas._mouse.x > this.pos.x - (this.width * this.localScale) / 2 &&
                canvas_1.Canvas._mouse.x < this.pos.x + (this.width * this.localScale) / 2 &&
                canvas_1.Canvas._mouse.y > this.pos.y - (this.height * this.localScale) / 2 &&
                canvas_1.Canvas._mouse.y < this.pos.y + (this.height * this.localScale) / 2) {
                this.mouseIsOver = true;
            }
        }
        else {
            this.mouseIsOver = false;
        }
        if (mousWasOver !== this.mouseIsOver) {
            if (this.mouseIsOver) {
                this.notifyObservers({
                    event: new MouseEvent("mouseover"),
                    type: "mouseIsOver",
                    pos: data.pos,
                });
            }
            else {
                this.notifyObservers({
                    event: new MouseEvent("mouseout"),
                    type: "mouseIsOut",
                    pos: data.pos,
                });
            }
        }
    }
    notifyObservers(data) { }
    getDeltaMouse() {
        let rtn = main_1.gp5.createVector(0, 0);
        if (this.mouseIsOver) {
            rtn.x = canvas_1.Canvas._mouse.x - this.pos.x;
            rtn.y = canvas_1.Canvas._mouse.y - this.pos.y;
        }
        return rtn;
    }
    getDistToMouse() {
        return main_1.gp5.dist(canvas_1.Canvas._mouse.x, canvas_1.Canvas._mouse.y, this.pos.x, this.pos.y);
    }
}
exports.Button = Button;
//# sourceMappingURL=button.js.map